using RecruitmentSystemAPI.Models;

namespace RecruitmentSystemAPI.Repositories.Interfaces;

public interface IInterviewRepository
{
    Task AddAsync(Interview interview);
    Task<IEnumerable<Interview>> GetAllAsync();
    Task<Interview?> GetByIdWithCandidateAsync(int interviewId);
    Task UpdateAsync(Interview interview);
    Task<IEnumerable<Interview>> GetInterviewsForCandidateAsync(int candidateId);
}
