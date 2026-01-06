using RecruitmentSystemAPI.Models;

using Microsoft.AspNetCore.Http;

namespace RecruitmentSystemAPI.Services;

public interface ICandidateService
{
    Task<Candidate> CreateCandidateAsync(CreateCandidateRequest dto, IFormFile? file, CancellationToken ct = default);
    Task<IEnumerable<Candidate>> GetAllAsync();
    Task<Candidate?> GetAsync(int id);
    Task<Candidate?> GetByEmailAsync(string email);

    Task<IEnumerable<Interview>> GetInterviewsForCandidateAsync(int candidateId);
    Task<IEnumerable<Offer>> GetOffersForCandidateAsync(int candidateId);
    Task<IEnumerable<StatusHistory>> GetStatusHistoryForCandidateAsync(int candidateId);

    Task<CandidateDocument> UploadDocumentAsync(int candidateId, IFormFile file, CancellationToken ct = default);

    Task<BulkUploadResult> BulkUploadFromExcelAsync(IFormFile excelFile, CancellationToken ct = default);   
}