namespace RecruitmentSystemAPI.Models;

public class Screening
{
    public int Id { get; set; }

    public int CandidateId { get; set; }
    public int JobId { get; set; }

    public string ReviewerName { get; set; } = default!;
    public string Status { get; set; } = "Pending"; 
    // Pending | Shortlisted | Rejected | OnHold

    public string? Comments { get; set; }
    public DateTime ScreenedAt { get; set; } = DateTime.UtcNow;

    public Candidate? Candidate { get; set; }
    public Job? Job { get; set; }

    public List<ScreeningSkill> Skills { get; set; } = new();
}