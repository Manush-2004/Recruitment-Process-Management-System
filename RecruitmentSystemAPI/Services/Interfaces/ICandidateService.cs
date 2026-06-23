using RecruitmentSystemAPI.DTOs;
using RecruitmentSystemAPI.Models;
using Microsoft.AspNetCore.Http;

namespace RecruitmentSystemAPI.Services.Interfaces;

public interface ICandidateService
{
    Task<Candidate> CreateCandidateAsync(CreateCandidateRequest dto, IFormFile? file, CancellationToken ct = default);
    Task AddSkillsForCandidateAsync(int candidateId, List<CandidateSkill> skills);
    Task UpdateSkillsForCandidateAsync(int candidateId, List<CandidateSkill> skills);
    Task RemoveSkillAsync(int candidateId, int skillId);
    Task<IEnumerable<Candidate>> GetAllAsync();
    Task<Candidate?> GetAsync(int id);
    Task<Candidate?> GetByEmailAsync(string email);

    Task<IEnumerable<Interview>> GetInterviewsForCandidateAsync(int candidateId);
    Task<IEnumerable<Offer>> GetOffersForCandidateAsync(int candidateId);
    Task<IEnumerable<StatusHistory>> GetStatusHistoryForCandidateAsync(int candidateId);

    Task<CandidateDocument> UploadDocumentAsync(int candidateId, IFormFile file, string? type = null, CancellationToken ct = default);

    Task<IEnumerable<Candidate>> GetCandidatesAtStageAsync(string stage);

    Task<IEnumerable<CandidateDocument>> GetCandidateDocumentsAsync(int candidateId);
    Task<CandidateDocument> VerifyDocumentAsync(int candidateId, int documentId, bool verified);

    Task<BulkUploadResult> BulkUploadFromExcelAsync(IFormFile excelFile, CancellationToken ct = default);

    // Move candidate to HR stage (triggered by recruiters after reviewing interview feedback summary)
    Task MoveCandidateToHrAsync(int candidateId, string actor);

    // Update candidate basic info (e.g., Phone). Does not allow changing Email/FullName/Password.
    Task<Candidate> UpdateCandidateAsync(int candidateId, UpdateCandidateRequest req);
}
