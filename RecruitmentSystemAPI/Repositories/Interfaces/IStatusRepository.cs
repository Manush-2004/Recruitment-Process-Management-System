using RecruitmentSystemAPI.Models;

namespace RecruitmentSystemAPI.Repositories.Interfaces;

public interface IStatusRepository
{
    Task AddStatusHistoryAsync(StatusHistory history);
    Task<IEnumerable<StatusHistory>> GetStatusHistoryForCandidateAsync(int candidateId);
}
