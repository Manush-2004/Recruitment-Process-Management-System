namespace RecruitmentSystemAPI.Models;

public class Interview
{
    public int Id { get; set; }
    public int CandidateId { get; set; }
    public int JobId { get; set; }

    public string RoundType { get; set; } = "Technical"; 
    // Technical | HR | Managerial

    public DateTime ScheduledAt { get; set; }
    public string Mode { get; set; } = "Online"; // Online | Offline
    public string? MeetingLink { get; set; }

    public string Status { get; set; } = "Scheduled";
    // Scheduled | Completed | Cancelled

    public Candidate? Candidate { get; set; }
    public Job? Job { get; set; }

    public List<Interviewer> Interviewers { get; set; } = new();
}
