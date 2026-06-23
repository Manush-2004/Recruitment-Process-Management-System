namespace RecruitmentSystemAPI.DTOs;

public class ScreeningSkillRequest
{
    public string SkillName { get; set; } = default!;
    public int YearsOfExperience { get; set; }
    public bool IsApproved { get; set; }
}
