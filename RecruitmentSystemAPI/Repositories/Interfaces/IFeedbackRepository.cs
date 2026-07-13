using RecruitmentSystemAPI.Models;

namespace RecruitmentSystemAPI.Repositories.Interfaces;

public interface IFeedbackRepository
{
    Task<bool> HasSubmittedAsync(int interviewId, int interviewerUserId);
    Task AddFeedbackAsync(InterviewFeedback feedback);
    Task<IEnumerable<InterviewFeedback>> GetFeedbacksByInterviewIdAsync(int interviewId);
    Task<IEnumerable<InterviewFeedback>> GetFeedbacksByCandidateAndJobAsync(int candidateId, int jobId);
}
