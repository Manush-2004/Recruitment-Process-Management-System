namespace RecruitmentSystemAPI.DTOs;

public class ScreeningRequest
{
    public int CandidateId { get; set; }
    public int JobId { get; set; }
    public string ReviewerName { get; set; } = default!;

    // Nullable to support both assignment (Pending) and direct screening workflows
    public string? Status { get; set; }
    public string? Comments { get; set; }
    public List<ScreeningSkillRequest>? Skills { get; set; }
}
