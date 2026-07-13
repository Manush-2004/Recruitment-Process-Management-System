using Microsoft.EntityFrameworkCore;
using RecruitmentSystemAPI.Data;
using RecruitmentSystemAPI.Models;
using RecruitmentSystemAPI.Repositories.Interfaces;

namespace RecruitmentSystemAPI.Repositories.Implementations;

public class InterviewRepository : IInterviewRepository
{
    private readonly AppDbContext _db;

    public InterviewRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task AddAsync(Interview interview)
    {
        _db.Interviews.Add(interview);
        await _db.SaveChangesAsync();
    }

    public async Task<IEnumerable<Interview>> GetAllAsync()
    {
        return await _db.Interviews
                        .Include(i => i.Interviewers)
                        .Include(i => i.Job)
                        .Include(i => i.Candidate)
                        .OrderBy(i => i.ScheduledAt)
                        .AsNoTracking()
                        .ToListAsync();
    }

    public async Task<Interview?> GetByIdWithCandidateAsync(int interviewId)
    {
        return await _db.Interviews
            .Include(i => i.Candidate)
            .FirstOrDefaultAsync(i => i.Id == interviewId);
    }

    public async Task UpdateAsync(Interview interview)
    {
        await _db.SaveChangesAsync();
    }

    public async Task<IEnumerable<Interview>> GetInterviewsForCandidateAsync(int candidateId)
    {
        return await _db.Interviews
                        .Include(i => i.Interviewers)
                        .Include(i => i.Job)
                        .Where(i => i.CandidateId == candidateId)
                        .OrderBy(i => i.ScheduledAt)
                        .AsNoTracking()
                        .ToListAsync();
    }
}
