using Microsoft.EntityFrameworkCore;
using RecruitmentSystemAPI.Data;
using RecruitmentSystemAPI.Models;
using RecruitmentSystemAPI.Repositories.Interfaces;

namespace RecruitmentSystemAPI.Repositories.Implementations;

public class StatusRepository : IStatusRepository
{
    private readonly AppDbContext _db;

    public StatusRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task AddStatusHistoryAsync(StatusHistory history)
    {
        _db.StatusHistories.Add(history);
        await _db.SaveChangesAsync();
    }

    public async Task<IEnumerable<StatusHistory>> GetStatusHistoryForCandidateAsync(int candidateId)
    {
        return await _db.StatusHistories
                        .Where(s => s.CandidateId == candidateId)
                        .OrderByDescending(s => s.Id)
                        .AsNoTracking()
                        .ToListAsync();
    }
}
