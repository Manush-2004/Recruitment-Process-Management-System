using RecruitmentSystemAPI.Data;
using RecruitmentSystemAPI.Models;

public class InterviewService : IInterviewService
{
    private readonly AppDbContext _db;
    private readonly IEmailService _email;
    private readonly StatusService _statusService;

    public InterviewService(AppDbContext db, IEmailService email, StatusService statusService)
    {
        _db = db;
        _email = email;
        _statusService = statusService;
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
            await _email.SendAsync(
                iv.Email,
                "Interview Scheduled",
                $"Interview ({interview.RoundType}) scheduled at {interview.ScheduledAt}. Link: {interview.MeetingLink}"
            );
        }

        return interview;
    }
}
