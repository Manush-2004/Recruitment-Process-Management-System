using RecruitmentSystemAPI.Models;

public interface IFeedbackService
{
    Task SubmitFeedbackAsync(FeedbackRequest request);
    Task<bool> HasSubmittedAsync(int interviewId, int interviewerUserId);
    Task<InterviewFeedbackSummary> GetInterviewSummaryAsync(int interviewId);
}
