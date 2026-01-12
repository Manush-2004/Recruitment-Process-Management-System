public class InterviewFeedbackSummary
{
    public int InterviewId { get; set; }
    // Optional metadata when aggregating by candidate+job
    public int? CandidateId { get; set; }
    public string? CandidateName { get; set; }
    public int? JobId { get; set; }
    public double? SuggestedSalary { get; set; }

    public double AverageRating { get; set; }
    public int TotalFeedbacks { get; set; }
    public List<InterviewerFeedbackView> Feedbacks { get; set; } = new();
}

public class InterviewerFeedbackView
{
    public string InterviewerName { get; set; } = default!;
    public int OverallRating { get; set; }
    public string Comments { get; set; } = default!;
    public List<FeedbackSkillView> Skills { get; set; } = new();
}

public class FeedbackSkillView
{
    public string SkillName { get; set; } = default!;
    public int Rating { get; set; }
}
//DTO