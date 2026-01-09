using RecruitmentSystemAPI.Models;

public interface IFeedbackService
{
    Task SubmitFeedbackAsync(FeedbackRequest request);
    Task<bool> HasSubmittedAsync(int interviewId, int interviewerUserId);
    Task<bool> HasSubmittedByEmailAsync(int interviewId, string email);
    Task<InterviewFeedbackSummary> GetInterviewSummaryAsync(int interviewId);
}
