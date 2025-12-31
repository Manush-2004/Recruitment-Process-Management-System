namespace RecruitmentSystemAPI.Models;

public class FeedbackSkill
{
    public int Id { get; set; }
    public int InterviewFeedbackId { get; set; }

    public string SkillName { get; set; } = default!;
    public int Rating { get; set; } // 1–5

    public InterviewFeedback? InterviewFeedback { get; set; }
}
