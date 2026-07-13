using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using RecruitmentSystemAPI.Data;
using RecruitmentSystemAPI.Models;
using RecruitmentSystemAPI.Repositories.Interfaces;

namespace RecruitmentSystemAPI.Repositories.Implementations;

public class CandidateRepository : ICandidateRepository
{
    private readonly AppDbContext _db;
    private IDbContextTransaction? _currentTransaction;

    public CandidateRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task<Candidate?> GetByEmailAsync(string email)
    {
        return await _db.Candidates.FirstOrDefaultAsync(c => c.Email == email);
    }

    public async Task AddAsync(Candidate candidate)
    {
        _db.Candidates.Add(candidate);
        await _db.SaveChangesAsync();
    }

    public async Task AddSkillsAsync(IEnumerable<CandidateSkill> skills)
    {
        _db.CandidateSkills.AddRange(skills);
        await _db.SaveChangesAsync();
    }

    public async Task UpdatePhoneAsync(Candidate candidate, string phone)
    {
        candidate.Phone = phone;
        await _db.SaveChangesAsync();
    }

    public async Task<bool> ExistsByEmailAsync(string email)
    {
        return await _db.Candidates.AnyAsync(c => c.Email == email);
    }

    public async Task<Candidate?> GetByIdAsync(int id)
    {
        return await _db.Candidates.FindAsync(id);
    }

    public async Task<Candidate?> GetByIdWithDetailsAsync(int id)
    {
        return await _db.Candidates
                        .Include(c => c.Documents)
                        .Include(c => c.Skills)
                        .Include(c => c.CandidateJobs)
                            .ThenInclude(cj => cj.Job)
                        .AsNoTracking()
                        .FirstOrDefaultAsync(c => c.Id == id);
    }

    public async Task<Candidate?> GetByEmailWithDetailsAsync(string email)
    {
        return await _db.Candidates
                        .Include(c => c.Documents)
                        .Include(c => c.Skills)
                        .Include(c => c.CandidateJobs)
                        .AsNoTracking()
                        .FirstOrDefaultAsync(c => c.Email == email);
    }

    public async Task<IEnumerable<Candidate>> GetAllWithDocumentsAsync()
    {
        return await _db.Candidates.Include(c => c.Documents).OrderByDescending(c => c.CreatedAt).ToListAsync();
    }
    
    public async Task<IEnumerable<CandidateDocument>> GetDocumentsByCandidateIdAsync(int candidateId)
    {
        return await _db.CandidateDocuments
                        .Where(d => d.CandidateId == candidateId)
                        .AsNoTracking()
                        .ToListAsync();
    }

    public async Task<IEnumerable<CandidateDocument>> GetOldResumesAsync(int candidateId)
    {
        return await _db.CandidateDocuments.Where(d => d.CandidateId == candidateId && (d.FileName.ToLower().Contains("resume") || d.FilePath.ToLower().Contains("resume"))).ToListAsync();
    }

    public async Task RemoveDocumentsAsync(IEnumerable<CandidateDocument> documents)
    {
        _db.CandidateDocuments.RemoveRange(documents);
        await _db.SaveChangesAsync();
    }

    public async Task AddDocumentAsync(CandidateDocument document)
    {
        _db.CandidateDocuments.Add(document);
        await _db.SaveChangesAsync();
    }

    public async Task<CandidateDocument?> GetDocumentAsync(int candidateId, int documentId)
    {
        return await _db.CandidateDocuments.FirstOrDefaultAsync(d => d.Id == documentId && d.CandidateId == candidateId);
    }

    public async Task UpdateDocumentAsync(CandidateDocument document)
    {
        await _db.SaveChangesAsync();
    }

    public async Task UpdateCandidateAsync(Candidate candidate)
    {
        await _db.SaveChangesAsync();
    }

    public async Task<Candidate?> GetByIdWithSkillsAsync(int id)
    {
        return await _db.Candidates.Include(c => c.Skills).FirstOrDefaultAsync(c => c.Id == id);
    }

    public async Task UpdateSkillsAsync(Candidate candidate, List<CandidateSkill> skills)
    {
        foreach (var sk in skills)
        {
            if (sk.Id != 0)
            {
                var existing = candidate.Skills.FirstOrDefault(s => s.Id == sk.Id);
                if (existing != null)
                {
                    existing.Name = sk.Name ?? existing.Name;
                    existing.Years = sk.Years;
                }
            }
            else if (!string.IsNullOrWhiteSpace(sk.Name))
            {
                var existingByName = candidate.Skills.FirstOrDefault(s => s.Name.Equals(sk.Name, StringComparison.OrdinalIgnoreCase));
                if (existingByName != null)
                {
                    existingByName.Years = sk.Years;
                }
                else
                {
                    sk.CandidateId = candidate.Id;
                    _db.CandidateSkills.Add(sk);
                }
            }
        }
        await _db.SaveChangesAsync();
    }

    public async Task<CandidateSkill?> GetSkillAsync(int candidateId, int skillId)
    {
        return await _db.CandidateSkills.FirstOrDefaultAsync(s => s.Id == skillId && s.CandidateId == candidateId);
    }

    public async Task RemoveSkillAsync(CandidateSkill skill)
    {
        _db.CandidateSkills.Remove(skill);
        await _db.SaveChangesAsync();
    }

    public async Task<IEnumerable<Candidate>> GetCandidatesByIdsWithDocumentsAsync(IEnumerable<int> candidateIds)
    {
        return await _db.Candidates
                        .Where(c => candidateIds.Contains(c.Id))
                        .Include(c => c.Documents)
                        .AsNoTracking()
                        .ToListAsync();
    }

    public async Task<bool> HasJobLinkAsync(int candidateId, int jobId)
    {
        return await _db.CandidateJobs.AnyAsync(cj => cj.CandidateId == candidateId && cj.JobId == jobId);
    }

    public async Task AddJobLinkAsync(CandidateJob candidateJob)
    {
        _db.CandidateJobs.Add(candidateJob);
        await _db.SaveChangesAsync();
    }

    public async Task<IEnumerable<Candidate>> GetCandidatesAtStageAsync(string stage)
    {
        var allStatuses = await _db.StatusHistories.AsNoTracking().ToListAsync();

        var latestIds = allStatuses
            .GroupBy(s => s.CandidateId)
            .Select(g => g.OrderByDescending(s => s.ChangedAt).First())
            .Where(s => s.NewStatus == stage)
            .Select(s => s.CandidateId)
            .ToList();

        return await _db.Candidates
                        .Where(c => latestIds.Contains(c.Id))
                        .Include(c => c.Documents)
                        .AsNoTracking()
                        .ToListAsync();
    }

    public async Task BeginTransactionAsync(CancellationToken ct)
    {
        if (_currentTransaction != null) return;
        _currentTransaction = await _db.Database.BeginTransactionAsync(ct);
    }

    public async Task CommitTransactionAsync(CancellationToken ct)
    {
        try
        {
            if (_currentTransaction != null)
            {
                await _currentTransaction.CommitAsync(ct);
            }
        }
        finally
        {
            if (_currentTransaction != null)
            {
                await _currentTransaction.DisposeAsync();
                _currentTransaction = null;
            }
        }
    }

    public async Task RollbackTransactionAsync(CancellationToken ct)
    {
        try
        {
            if (_currentTransaction != null)
            {
                await _currentTransaction.RollbackAsync(ct);
            }
        }
        finally
        {
            if (_currentTransaction != null)
            {
                await _currentTransaction.DisposeAsync();
                _currentTransaction = null;
            }
        }
    }
}
