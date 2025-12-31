namespace RecruitmentSystemAPI.Models;

public class FeedbackRequest
{
    public int InterviewId { get; set; }

    // Comes from JWT token
    public int InterviewerUserId { get; set; }
    public string InterviewerName { get; set; } = default!;
    public int OverallRating { get; set; }
    public string Comments { get; set; } = default!;
    public List<FeedbackSkillRequest> Skills { get; set; } = new();
}

public class FeedbackSkillRequest
{
    public string SkillName { get; set; } = default!;
    public int Rating { get; set; }
}
//DTO