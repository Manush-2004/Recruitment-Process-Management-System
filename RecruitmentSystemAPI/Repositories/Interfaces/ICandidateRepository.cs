using RecruitmentSystemAPI.Models;

namespace RecruitmentSystemAPI.Repositories.Interfaces;

public interface ICandidateRepository
{
    Task<Candidate?> GetByEmailAsync(string email);
    Task AddAsync(Candidate candidate);
    Task AddSkillsAsync(IEnumerable<CandidateSkill> skills);
    Task UpdatePhoneAsync(Candidate candidate, string phone);

    Task<bool> ExistsByEmailAsync(string email);
    Task<Candidate?> GetByIdAsync(int id);
    Task<Candidate?> GetByIdWithDetailsAsync(int id);
    Task<Candidate?> GetByEmailWithDetailsAsync(string email);
    Task<IEnumerable<Candidate>> GetAllWithDocumentsAsync();
    
    Task<IEnumerable<CandidateDocument>> GetDocumentsByCandidateIdAsync(int candidateId);
    Task<IEnumerable<CandidateDocument>> GetOldResumesAsync(int candidateId);
    Task RemoveDocumentsAsync(IEnumerable<CandidateDocument> documents);
    Task AddDocumentAsync(CandidateDocument document);
    Task<CandidateDocument?> GetDocumentAsync(int candidateId, int documentId);
    Task UpdateDocumentAsync(CandidateDocument document);

    Task UpdateCandidateAsync(Candidate candidate);

    Task<Candidate?> GetByIdWithSkillsAsync(int id);
    Task UpdateSkillsAsync(Candidate candidate, List<CandidateSkill> skills);
    Task<CandidateSkill?> GetSkillAsync(int candidateId, int skillId);
    Task RemoveSkillAsync(CandidateSkill skill);

    Task<IEnumerable<Candidate>> GetCandidatesByIdsWithDocumentsAsync(IEnumerable<int> candidateIds);

    Task<bool> HasJobLinkAsync(int candidateId, int jobId);
    Task AddJobLinkAsync(CandidateJob candidateJob);

    Task<IEnumerable<Candidate>> GetCandidatesAtStageAsync(string stage);

    Task BeginTransactionAsync(CancellationToken ct);
    Task CommitTransactionAsync(CancellationToken ct);
    Task RollbackTransactionAsync(CancellationToken ct);
}
