using RecruitmentSystemAPI.Models;

public interface IScreeningService
{
    Task<Screening> ScreenCandidateAsync(ScreeningRequest request);
    Task<bool> AlreadyScreenedAsync(int candidateId, int jobId);

    Task<IEnumerable<Screening>> GetAssignedForReviewerAsync(string reviewerName);
    Task<IEnumerable<Screening>> GetHistoryForReviewerAsync(string reviewerName);
    Task<IEnumerable<Screening>> GetForCandidateAsync(int candidateId);
    Task<Screening> UpdateScreeningAsync(int screeningId, UpdateScreeningRequest request, string? callerName = null, bool asReviewer = false);
}
