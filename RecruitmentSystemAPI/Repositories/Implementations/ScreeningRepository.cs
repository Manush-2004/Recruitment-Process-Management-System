using Microsoft.EntityFrameworkCore;
using RecruitmentSystemAPI.Data;
using RecruitmentSystemAPI.Models;
using RecruitmentSystemAPI.Repositories.Interfaces;

namespace RecruitmentSystemAPI.Repositories.Implementations;

public class ScreeningRepository : IScreeningRepository
{
    private readonly AppDbContext _db;

    public ScreeningRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task<bool> HasCompletedScreeningAsync(int candidateId, int jobId)
    {
        return await _db.Screenings
            .AnyAsync(s => s.CandidateId == candidateId && s.JobId == jobId && (s.ScreenedAt != null || s.Status != "Pending"));
    }

    public async Task<Screening?> GetPendingScreeningAsync(int candidateId, int jobId, string reviewerName)
    {
        return await _db.Screenings
            .FirstOrDefaultAsync(s => s.CandidateId == candidateId && s.JobId == jobId && s.Status == "Pending" && s.ReviewerName == reviewerName);
    }

    public async Task AddScreeningAsync(Screening screening)
    {
        _db.Screenings.Add(screening);
        await _db.SaveChangesAsync();
    }

    public async Task UpdateScreeningAndSkillsAsync(Screening screening, List<ScreeningSkill> newSkills)
    {
        var existingSkills = _db.ScreeningSkills.Where(ss => ss.ScreeningId == screening.Id);
        _db.ScreeningSkills.RemoveRange(existingSkills);
        screening.Skills = newSkills;
        await _db.SaveChangesAsync();
    }

    public async Task<IEnumerable<Screening>> GetAssignedForReviewerAsync(string reviewerName)
    {
        return await _db.Screenings
            .Where(s => s.ReviewerName == reviewerName && s.Status == "Pending")
            .Include(s => s.Candidate)
            .Include(s => s.Job)
            .Include(s => s.Skills)
            .OrderBy(s => s.ScreenedAt)
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<IEnumerable<Screening>> GetHistoryForReviewerAsync(string reviewerName)
    {
        return await _db.Screenings
            .Where(s => s.ReviewerName == reviewerName && s.ScreenedAt != null)
            .Include(s => s.Candidate)
            .Include(s => s.Job)
            .Include(s => s.Skills)
            .OrderByDescending(s => s.ScreenedAt)
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<IEnumerable<Screening>> GetForCandidateAsync(int candidateId)
    {
        return await _db.Screenings
            .Where(s => s.CandidateId == candidateId)
            .Include(s => s.Job)
            .Include(s => s.Skills)
            .OrderByDescending(s => s.ScreenedAt)
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<Screening?> GetByIdWithSkillsAsync(int screeningId)
    {
        return await _db.Screenings.Include(s => s.Skills).FirstOrDefaultAsync(s => s.Id == screeningId);
    }
}
