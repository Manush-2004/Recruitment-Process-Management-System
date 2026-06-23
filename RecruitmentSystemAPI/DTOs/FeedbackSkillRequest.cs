namespace RecruitmentSystemAPI.DTOs;

public class FeedbackSkillRequest
{
    public string SkillName { get; set; } = default!;
    public int Rating { get; set; }
}
