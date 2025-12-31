using RecruitmentSystemAPI.Models;

using Microsoft.AspNetCore.Http;

namespace RecruitmentSystemAPI.Services;

public interface ICandidateService
{
    Task<Candidate> CreateCandidateAsync(CreateCandidateRequest dto, IFormFile? file, CancellationToken ct = default);
    Task<IEnumerable<Candidate>> GetAllAsync();
    Task<Candidate?> GetAsync(int id);
    Task<BulkUploadResult> BulkUploadFromExcelAsync(IFormFile excelFile, CancellationToken ct = default);   
}