using RecruitmentSystemAPI.Data;
using RecruitmentSystemAPI.Models;
using Microsoft.EntityFrameworkCore;

public class InterviewService : IInterviewService
{
    private readonly AppDbContext _db;
    private readonly IEmailService _email;
    private readonly StatusService _statusService;
    private readonly INotificationService _notify;
    private readonly ILogger<InterviewService> _logger;

    public InterviewService(AppDbContext db, IEmailService email, StatusService statusService, INotificationService notify, ILogger<InterviewService> logger)
    {
        _db = db;
        _email = email;
        _statusService = statusService;
        _notify = notify;
        _logger = logger;
    }

    public async Task<Interview> ScheduleAsync(InterviewRequest req)
    {
        var interview = new Interview
        {
            CandidateId = req.CandidateId,
            JobId = req.JobId,
            RoundType = req.RoundType,
            // Store scheduled time as UTC for consistent display across clients
            ScheduledAt = req.ScheduledAt.ToUniversalTime(),
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
                // Also send an in-app notification (SignalR) targeted to the interviewer if possible
                try
                {
                    await _notify.SendToUserEmailAsync(iv.Email, $"Interview scheduled: {iv.Name} — {interview.RoundType} at {interview.ScheduledAt}");
                }
                catch (Exception nEx)
                {
                    _logger.LogWarning(nEx, "Failed to send in-app notification for {email}", iv.Email);
                }
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
