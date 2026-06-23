namespace RecruitmentSystemAPI.DTOs;

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
