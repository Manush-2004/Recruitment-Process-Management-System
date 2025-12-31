using RecruitmentSystemAPI.Models;

public interface IScreeningService
{
    Task<Screening> ScreenCandidateAsync(ScreeningRequest request);
    Task<bool> AlreadyScreenedAsync(int candidateId, int jobId);
}
