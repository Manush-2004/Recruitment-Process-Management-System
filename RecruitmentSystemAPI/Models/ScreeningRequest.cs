namespace RecruitmentSystemAPI.Models;

public class ScreeningRequest
{
    public int CandidateId { get; set; }
    public int JobId { get; set; }
    public string ReviewerName { get; set; } = default!;
    public string Status { get; set; } = default!;
    public string? Comments { get; set; }
    public List<ScreeningSkillRequest> Skills { get; set; } = new();
}

public class ScreeningSkillRequest
{
    public string SkillName { get; set; } = default!;
    public int YearsOfExperience { get; set; }
    public bool IsApproved { get; set; }
}
//DTO