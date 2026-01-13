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
            // Store the datetime as-is without timezone conversion
            // Frontend sends local time, we preserve it exactly
            ScheduledAt = DateTime.SpecifyKind(req.ScheduledAt, DateTimeKind.Unspecified),
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

        // Only change status for non-HR interviews
        // HR interviews should keep candidates at HR stage until decision is made
        if (req.RoundType != "HR Round")
        {
            await _statusService.ChangeCandidateStatusAsync(
                req.CandidateId,
                "Shortlisted",
                "Interview Scheduled",
                "Recruiter"
            );
        }

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

    public async Task<Interview> UpdateInterviewResultAsync(int interviewId, string result, string actor)
    {
        var interview = await _db.Interviews
            .Include(i => i.Candidate)
            .FirstOrDefaultAsync(i => i.Id == interviewId);

        if (interview == null)
            throw new ArgumentException("Interview not found");

        interview.Result = result;
        interview.Status = "Completed";
        await _db.SaveChangesAsync();

        // Update candidate status based on result
        if (interview.RoundType == "HR Round")
        {
            if (result == "Selected")
            {
                // Keep at HR stage - they can now generate offer
                // No status change needed
            }
            else if (result == "Rejected")
            {
                await _statusService.ChangeCandidateStatusAsync(
                    interview.CandidateId,
                    "HR",
                    "Rejected",
                    actor
                );
            }
        }

        return interview;
    }
}
