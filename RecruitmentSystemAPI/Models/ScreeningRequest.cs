namespace RecruitmentSystemAPI.Models;

public class ScreeningRequest
{
    public int CandidateId { get; set; }
    public int JobId { get; set; }
    public string ReviewerName { get; set; } = default!;

    // MUST be nullable so recruiter assignment works
    public string Status { get; set; }
    public string? Comments { get; set; }
    public List<ScreeningSkillRequest> Skills { get; set; }
}

public class ScreeningSkillRequest
{
    public string SkillName { get; set; } = default!;
    public int YearsOfExperience { get; set; }
    public bool IsApproved { get; set; }
}
//DTO