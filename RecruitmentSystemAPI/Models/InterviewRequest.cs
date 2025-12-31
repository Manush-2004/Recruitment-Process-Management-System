namespace RecruitmentSystemAPI.Models;

public class InterviewRequest
{
    public int CandidateId { get; set; }
    public int JobId { get; set; }
    public string RoundType { get; set; } = default!;
    public DateTime ScheduledAt { get; set; }
    public string Mode { get; set; } = "Online";
    public string? MeetingLink { get; set; }
    public List<InterviewerRequest> Interviewers { get; set; } = new();
}

public class InterviewerRequest
{
    public string Name { get; set; } = default!;
    public string Email { get; set; } = default!;
}
//DTO