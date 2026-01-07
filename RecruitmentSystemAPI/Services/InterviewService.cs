using RecruitmentSystemAPI.Data;
using RecruitmentSystemAPI.Models;
using Microsoft.EntityFrameworkCore;

public class InterviewService : IInterviewService
{
    private readonly AppDbContext _db;
    private readonly IEmailService _email;
    private readonly StatusService _statusService;
    private readonly ILogger<InterviewService> _logger;

    public InterviewService(AppDbContext db, IEmailService email, StatusService statusService, ILogger<InterviewService> logger)
    {
        _db = db;
        _email = email;
        _statusService = statusService;
        _logger = logger;
    }

    public async Task<Interview> ScheduleAsync(InterviewRequest req)
    {
        var interview = new Interview
        {
            CandidateId = req.CandidateId,
            JobId = req.JobId,
            RoundType = req.RoundType,
            ScheduledAt = req.ScheduledAt,
            Mode = req.Mode,
            MeetingLink = req.MeetingLink,
            Interviewers = req.Interviewers.Select(i => new Interviewer
            {
                Name = i.Name,
                Email = i.Email
            }).ToList()
        };

        _db.Interviews.Add(interview);
        await _db.SaveChangesAsync();

        await _statusService.ChangeCandidateStatusAsync(
            req.CandidateId,
            "Shortlisted",
            "Interview Scheduled",
            "Recruiter"
        );

        foreach (var iv in interview.Interviewers)
        {
            try
            {
                await _email.SendAsync(
                    iv.Email,
                    "Interview Scheduled",
                    $"Interview ({interview.RoundType}) scheduled at {interview.ScheduledAt}. Link: {interview.MeetingLink}"
                );
            }
            catch (Exception ex)
            {
                // Log and continue; failing to send notifications should not block scheduling
                _logger.LogWarning(ex, "Failed to send interview notification to {email}", iv.Email);
            }
        }

        return interview;
    }

    public async Task<IEnumerable<Interview>> GetAllAsync()
    {
        return await _db.Interviews
                        .Include(i => i.Interviewers)
                        .Include(i => i.Job)
                        .Include(i => i.Candidate)
                        .OrderBy(i => i.ScheduledAt)
                        .AsNoTracking()
                        .ToListAsync();
    }
}
