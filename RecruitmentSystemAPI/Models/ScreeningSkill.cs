namespace RecruitmentSystemAPI.Models;

public class ScreeningSkill
{
    public int Id { get; set; }

    public int ScreeningId { get; set; }
    public string SkillName { get; set; } = default!;
    public int YearsOfExperience { get; set; }
    public bool IsApproved { get; set; }

    public Screening? Screening { get; set; }
}