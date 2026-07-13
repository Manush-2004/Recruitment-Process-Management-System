using Microsoft.EntityFrameworkCore;
using RecruitmentSystemAPI.Data;
using RecruitmentSystemAPI.Models;
using RecruitmentSystemAPI.Repositories.Interfaces;

namespace RecruitmentSystemAPI.Repositories.Implementations;

public class OfferRepository : IOfferRepository
{
    private readonly AppDbContext _db;

    public OfferRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task AddAsync(Offer offer)
    {
        _db.Offers.Add(offer);
        await _db.SaveChangesAsync();
    }

    public async Task<IEnumerable<Offer>> GetAllAsync()
    {
        return await _db.Offers
                        .Include(o => o.Candidate)
                        .OrderByDescending(o => o.CreatedAt)
                        .AsNoTracking()
                        .ToListAsync();
    }

    public async Task<IEnumerable<Offer>> GetOffersForCandidateAsync(int candidateId)
    {
        return await _db.Offers
                        .Where(o => o.CandidateId == candidateId)
                        .OrderByDescending(o => o.CreatedAt)
                        .AsNoTracking()
                        .ToListAsync();
    }
}
