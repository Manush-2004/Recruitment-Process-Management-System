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
    // ScreenedAt is only set when screening is completed; null indicates pending assignment
    public DateTime? ScreenedAt { get; set; } = null;

    public Candidate? Candidate { get; set; }
    public Job? Job { get; set; }

    public List<ScreeningSkill> Skills { get; set; } = new();
}