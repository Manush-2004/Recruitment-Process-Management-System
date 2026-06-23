namespace RecruitmentSystemAPI.Models;

public class StatusHistory
{
    public int Id { get; set; }
    public int CandidateId { get; set; }

    public string OldStatus { get; set; } = default!;
    public string NewStatus { get; set; } = default!;
    public string ChangedBy { get; set; } = default!;
    public DateTime ChangedAt { get; set; } = DateTime.UtcNow;

    public Candidate? Candidate { get; set; }
}