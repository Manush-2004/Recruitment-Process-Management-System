using RecruitmentSystemAPI.Models;

namespace RecruitmentSystemAPI.Repositories.Interfaces;

public interface IScreeningRepository
{
    Task<bool> HasCompletedScreeningAsync(int candidateId, int jobId);
    Task<Screening?> GetPendingScreeningAsync(int candidateId, int jobId, string reviewerName);
    Task AddScreeningAsync(Screening screening);
    Task UpdateScreeningAndSkillsAsync(Screening screening, List<ScreeningSkill> newSkills);
    Task<IEnumerable<Screening>> GetAssignedForReviewerAsync(string reviewerName);
    Task<IEnumerable<Screening>> GetHistoryForReviewerAsync(string reviewerName);
    Task<IEnumerable<Screening>> GetForCandidateAsync(int candidateId);
    Task<Screening?> GetByIdWithSkillsAsync(int screeningId);
}
