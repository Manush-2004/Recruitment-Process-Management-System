using RecruitmentSystemAPI.Models;

namespace RecruitmentSystemAPI.Repositories.Interfaces;

public interface IOfferRepository
{
    Task AddAsync(Offer offer);
    Task<IEnumerable<Offer>> GetAllAsync();
    Task<IEnumerable<Offer>> GetOffersForCandidateAsync(int candidateId);
}
