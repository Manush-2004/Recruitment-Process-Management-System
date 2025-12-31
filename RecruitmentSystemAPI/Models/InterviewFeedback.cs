namespace RecruitmentSystemAPI.Models;

public class InterviewFeedback
{
    public int Id { get; set; }
    public int InterviewId { get; set; }

    //Identify interviewer uniquely
    public int InterviewerUserId { get; set; }
    public string InterviewerName { get; set; } = default!;
    public int OverallRating { get; set; } // 1–5
    public string Comments { get; set; } = default!;

    public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;

    public Interview? Interview { get; set; }
    public User? Interviewer { get; set; }
    public List<FeedbackSkill> Skills { get; set; } = new();
}
