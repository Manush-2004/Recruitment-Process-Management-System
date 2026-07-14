using RecruitmentSystemAPI.Models;
using RecruitmentSystemAPI.DTOs;
using RecruitmentSystemAPI.Exceptions;
using Microsoft.AspNetCore.Http;
using OfficeOpenXml;
using RecruitmentSystemAPI.Services.Interfaces;
using RecruitmentSystemAPI.Repositories.Interfaces;

namespace RecruitmentSystemAPI.Services.Implementations;

public class CandidateService : ICandidateService
{
    private readonly ICandidateRepository _candidateRepo;
    private readonly IInterviewRepository _interviewRepo;
    private readonly IOfferRepository _offerRepo;
    private readonly IStatusRepository _statusRepo;
    private readonly IAuthRepository _authRepo;
    private readonly IJobRepository _jobRepo;
    private readonly IWebHostEnvironment _env;
    private readonly ILogger<CandidateService> _logger;
    private readonly IAuthService _authService;
    private readonly StatusService _statusService;

    static CandidateService()
    {
        ExcelPackage.LicenseContext = LicenseContext.NonCommercial;
    }

    public CandidateService(ICandidateRepository candidateRepo, IInterviewRepository interviewRepo, IOfferRepository offerRepo, IStatusRepository statusRepo, IAuthRepository authRepo, IJobRepository jobRepo, IWebHostEnvironment env, ILogger<CandidateService> logger, IAuthService authService, StatusService statusService)
    {
        _candidateRepo = candidateRepo;
        _interviewRepo = interviewRepo;
        _offerRepo = offerRepo;
        _statusRepo = statusRepo;
        _authRepo = authRepo;
        _jobRepo = jobRepo;
        _env = env;
        _logger = logger;
        _authService = authService;
        _statusService = statusService;
    }

    public async Task<Candidate> CreateCandidateAsync(CreateCandidateRequest dto, IFormFile? file, CancellationToken ct = default)
    {
        try
        {
            // Prevent duplicate candidate or user
            if (await _candidateRepo.ExistsByEmailAsync(dto.Email))
                throw new ConflictException("User already exists");
            if (await _authService.GetUserByEmailAsync(dto.Email) != null)
                throw new ConflictException("User already exists");

            var candidate = new Candidate
            {
                FullName = dto.FullName,
                Email = dto.Email,
                Phone = dto.Phone
            };

            await _candidateRepo.AddAsync(candidate);

            if (!string.IsNullOrWhiteSpace(dto.Skills))
            {
                var parts = dto.Skills.Split(new[] { ',', ';' }, StringSplitOptions.RemoveEmptyEntries);
                var candidateSkills = new List<CandidateSkill>();
                foreach (var p in parts)
                {
                    var seg = p.Split(':', StringSplitOptions.RemoveEmptyEntries);
                    var name = seg[0].Trim();
                    var years = 0;
                    if (seg.Length > 1 && int.TryParse(seg[1].Trim(), out var y)) years = y;
                    if (string.IsNullOrWhiteSpace(name)) continue;
                    candidateSkills.Add(new CandidateSkill { CandidateId = candidate.Id, Name = name, Years = years });
                }
                if (candidateSkills.Count > 0)
                {
                    await _candidateRepo.AddSkillsAsync(candidateSkills);
                }
            }

            if (file is not null && file.Length > 0)
            {
                // treat this upload as a resume; remove any prior resume docs
                var uploadsRoot = Path.Combine(_env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads", "documents", candidate.Id.ToString());
                Directory.CreateDirectory(uploadsRoot);

                // Before saving, remove previous resume files (heuristic: Type == "Resume" or filename contains "resume")
                var prevResumes = await _candidateRepo.GetOldResumesAsync(candidate.Id);
                foreach (var pr in prevResumes)
                {
                    try
                    {
                        var absolute = Path.Combine(_env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), pr.FilePath.TrimStart('/').Replace('/', Path.DirectorySeparatorChar));
                        if (File.Exists(absolute)) File.Delete(absolute);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Failed to delete old resume file {Path}", pr.FilePath);
                    }
                }
                if (prevResumes.Any())
                {
                    await _candidateRepo.RemoveDocumentsAsync(prevResumes);
                }

                // sanitize and create filename
                var safeFileName = $"{Guid.NewGuid()}_{Path.GetFileName(file.FileName)}";
                var filePath = Path.Combine(uploadsRoot, safeFileName);

                using (var stream = File.Create(filePath))
                {
                    await file.CopyToAsync(stream, ct);
                }

                var relativePath = Path.Combine("uploads", "documents", candidate.Id.ToString(), safeFileName).Replace("\\", "/");

                var doc = new CandidateDocument
                {
                    CandidateId = candidate.Id,
                    FileName = file.FileName,
                    FilePath = "/" + relativePath,
                    ContentType = file.ContentType ?? "application/octet-stream",
                    Size = file.Length
                };

                await _candidateRepo.AddDocumentAsync(doc);
            }

            // If a password was provided, create a User account for this candidate
            if (!string.IsNullOrWhiteSpace(dto.Password))
            {
                try
                {
                    // Reuse auth service to register a Candidate user
                    await _authService.RegisterAsync(new RegisterRequest(dto.FullName, dto.Email, dto.Password, "Candidate"));
                }
                catch (Exception ex)
                {
                    // Log and continue — candidate record is still valid; caller may decide how to handle
                    _logger.LogWarning(ex, "Failed to create user for candidate {Email}: {Msg}", dto.Email, ex.Message);
                    throw new ConflictException("User already exists");
                }
            }

            // reload with documents and skills
            return await _candidateRepo.GetByIdWithDetailsAsync(candidate.Id) ?? candidate;
        }
        catch (ArgumentException) { throw; }
        catch (Exception ex)
        {
            _logger.LogError(ex, "CreateCandidateAsync failed for {Email}", dto?.Email);
            throw;
        }
    }

    public async Task<IEnumerable<Candidate>> GetAllAsync()
    {
        return await _candidateRepo.GetAllWithDocumentsAsync();
    }

    public async Task<Candidate?> GetAsync(int id)
    {
        return await _candidateRepo.GetByIdWithDetailsAsync(id);
    }

    public async Task<Candidate?> GetByEmailAsync(string email)
    {
        if (string.IsNullOrWhiteSpace(email)) return null;
        return await _candidateRepo.GetByEmailWithDetailsAsync(email);
    }

    public async Task<IEnumerable<Interview>> GetInterviewsForCandidateAsync(int candidateId)
    {
        return await _interviewRepo.GetInterviewsForCandidateAsync(candidateId);
    }

    public async Task<IEnumerable<Offer>> GetOffersForCandidateAsync(int candidateId)
    {
        return await _offerRepo.GetOffersForCandidateAsync(candidateId);
    }

    public async Task<IEnumerable<StatusHistory>> GetStatusHistoryForCandidateAsync(int candidateId)
    {
        return await _statusRepo.GetStatusHistoryForCandidateAsync(candidateId);
    }

    public async Task<CandidateDocument> UploadDocumentAsync(int candidateId, IFormFile file, string? type = null, CancellationToken ct = default)
    {
        if (file == null || file.Length == 0) throw new BadRequestException("File is required");

        // If uploading a resume (type == "Resume"), remove previous resume docs
        if (!string.IsNullOrWhiteSpace(type) && string.Equals(type, "Resume", StringComparison.OrdinalIgnoreCase))
        {
            var prevResumes = await _candidateRepo.GetOldResumesAsync(candidateId);
            foreach (var pr in prevResumes)
            {
                try
                {
                    var absolute = Path.Combine(_env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), pr.FilePath.TrimStart('/').Replace('/', Path.DirectorySeparatorChar));
                    if (File.Exists(absolute)) File.Delete(absolute);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to delete old resume file {Path}", pr.FilePath);
                }
            }
            if (prevResumes.Any())
            {
                await _candidateRepo.RemoveDocumentsAsync(prevResumes);
            }
        }
        var candidate = await _candidateRepo.GetByIdAsync(candidateId);
        if (candidate == null) throw new NotFoundException("Candidate not found");

        var uploadsRoot = Path.Combine(_env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads", "documents", candidateId.ToString());
        Directory.CreateDirectory(uploadsRoot);

        var safeFileName = $"{Guid.NewGuid()}_{Path.GetFileName(file.FileName)}";
        var filePath = Path.Combine(uploadsRoot, safeFileName);

        using (var stream = File.Create(filePath))
        {
            await file.CopyToAsync(stream, ct);
        }

        var relativePath = Path.Combine("uploads", "documents", candidateId.ToString(), safeFileName).Replace("\\", "/");

        var doc = new CandidateDocument
        {
            CandidateId = candidateId,
            FileName = file.FileName,
            FilePath = "/" + relativePath,
            ContentType = file.ContentType ?? "application/octet-stream",
            Size = file.Length
        };

        await _candidateRepo.AddDocumentAsync(doc);

        return doc;
    }

    // Move candidate to HR stage (called by recruiter after reviewing feedback)
    public async Task MoveCandidateToHrAsync(int candidateId, string actor)
    {
        var cand = await _candidateRepo.GetByIdAsync(candidateId);
        if (cand == null) throw new NotFoundException("Candidate not found");

        var latest = (await _statusRepo.GetStatusHistoryForCandidateAsync(candidateId))
            .FirstOrDefault()?.NewStatus;

        var oldStatus = latest ?? "Applied";
        await _statusService.ChangeCandidateStatusAsync(candidateId, oldStatus, "HR", actor);
    }

    public async Task AddSkillsForCandidateAsync(int candidateId, List<CandidateSkill> skills)
    {
        var candidate = await _candidateRepo.GetByIdWithSkillsAsync(candidateId);
        if (candidate == null) throw new NotFoundException("Candidate not found");

        var newSkills = new List<CandidateSkill>();
        foreach (var sk in skills)
        {
            if (candidate.Skills.Any(s => s.Name.Equals(sk.Name, StringComparison.OrdinalIgnoreCase))) continue;
            sk.CandidateId = candidateId;
            newSkills.Add(sk);
        }
        if (newSkills.Any())
        {
            await _candidateRepo.AddSkillsAsync(newSkills);
        }
    }

    public async Task UpdateSkillsForCandidateAsync(int candidateId, List<CandidateSkill> skills)
    {
        var candidate = await _candidateRepo.GetByIdWithSkillsAsync(candidateId);
        if (candidate == null) throw new NotFoundException("Candidate not found");

        await _candidateRepo.UpdateSkillsAsync(candidate, skills);
    }

    public async Task RemoveSkillAsync(int candidateId, int skillId)
    {
        var skill = await _candidateRepo.GetSkillAsync(candidateId, skillId);
        if (skill == null) throw new NotFoundException("Skill not found");
        await _candidateRepo.RemoveSkillAsync(skill);
    }

    public async Task<Candidate> UpdateCandidateAsync(int candidateId, UpdateCandidateRequest req)
    {
        var candidate = await _candidateRepo.GetByIdWithDetailsAsync(candidateId);
        if (candidate == null) throw new NotFoundException("Candidate not found");

        // Only allow updating certain fields for now. Ignore nulls.
        if (req.Phone is not null)
        {
            candidate.Phone = req.Phone;
        }

        await _candidateRepo.UpdateCandidateAsync(candidate);

        return candidate;
    }

    public async Task<IEnumerable<Candidate>> GetCandidatesAtStageAsync(string stage)
    {
        return await _candidateRepo.GetCandidatesAtStageAsync(stage);
    }

    public async Task<IEnumerable<CandidateDocument>> GetCandidateDocumentsAsync(int candidateId)
    {
        return await _candidateRepo.GetDocumentsByCandidateIdAsync(candidateId);
    }

    public async Task<CandidateDocument> VerifyDocumentAsync(int candidateId, int documentId, bool verified)
    {
        var doc = await _candidateRepo.GetDocumentAsync(candidateId, documentId);
        if (doc == null) throw new NotFoundException("Document not found");
        doc.Verified = verified;
        await _candidateRepo.UpdateDocumentAsync(doc);
        return doc;
    }

    public async Task<BulkUploadResult> BulkUploadFromExcelAsync(IFormFile excelFile, CancellationToken ct = default)
    {
        var result = new BulkUploadResult();

        if (excelFile == null || excelFile.Length == 0)
        {
            result.Errors.Add("No file provided.");
            return result;
        }

        using var stream = new MemoryStream();
        await excelFile.CopyToAsync(stream, ct);
        stream.Position = 0;

        using var package = new ExcelPackage(stream);
        if (package.Workbook.Worksheets.Count == 0)
        {
            result.Errors.Add("Excel contains no worksheets.");
            return result;
        }

        var ws = package.Workbook.Worksheets[0];
        var rowCount = ws.Dimension.End.Row;
        var colCount = ws.Dimension.End.Column;

        // find header indices (case-insensitive)
        var headers = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
        for (int c = 1; c <= colCount; c++)
        {
            var v = ws.Cells[1, c].GetValue<string>()?.Trim();
            if (!string.IsNullOrEmpty(v) && !headers.ContainsKey(v))
                headers[v] = c;
        }

        // required columns
        if (!headers.ContainsKey("FullName") || !headers.ContainsKey("Email"))
        {
            result.Errors.Add("Excel must contain 'FullName' and 'Email' columns.");
            return result;
        }

        // Enforce password presence in bulk uploads
        if (!headers.ContainsKey("Password"))
        {
            result.Errors.Add("Excel must contain 'Password' column when using bulk upload. Bulk upload aborted.");
            return result;
        }

        result.TotalRows = rowCount - 1;

        // Load all jobs and their required skills into memory for matching
        var jobs = await _jobRepo.GetAllJobsWithSkillsAsync();

        await _candidateRepo.BeginTransactionAsync(ct);

        for (int r = 2; r <= rowCount; r++)
        {
            try
            {
                var fullname = ws.Cells[r, headers["FullName"]].GetValue<string>()?.Trim();
                var email = ws.Cells[r, headers["Email"]].GetValue<string>()?.Trim();
                if (string.IsNullOrWhiteSpace(fullname) || string.IsNullOrWhiteSpace(email))
                {
                    result.Errors.Add($"Row {r}: missing FullName or Email.");
                    continue;
                }

                var phone = headers.ContainsKey("Phone") ? ws.Cells[r, headers["Phone"]].GetValue<string>()?.Trim() : null;
                var skillsRaw = headers.ContainsKey("Skills") ? ws.Cells[r, headers["Skills"]].GetValue<string>() : null;
                var passwordCell = ws.Cells[r, headers["Password"]].GetValue<string>()?.Trim();
                if (string.IsNullOrWhiteSpace(passwordCell))
                {
                    result.Errors.Add($"Row {r}: Password is required.");
                    continue;
                }

                // detect duplicates
                if (await _candidateRepo.ExistsByEmailAsync(email) || await _authRepo.UserExistsAsync(email))
                {
                    result.Errors.Add($"Row {r}: User already exists ({email}).");
                    continue;
                }

                // create candidate
                var cand = new Candidate
                {
                    FullName = fullname,
                    Email = email,
                    Phone = phone
                };
                await _candidateRepo.AddAsync(cand); // to get cand.Id

                // parse skills
                var candidateSkills = new List<CandidateSkill>();
                if (!string.IsNullOrWhiteSpace(skillsRaw))
                {
                    var parts = skillsRaw.Split(';', StringSplitOptions.RemoveEmptyEntries);
                    foreach (var p in parts)
                    {
                        var seg = p.Split(':', StringSplitOptions.RemoveEmptyEntries);
                        var name = seg[0].Trim();
                        var years = 0;
                        if (seg.Length > 1 && int.TryParse(seg[1].Trim(), out var y)) years = y;
                        if (string.IsNullOrWhiteSpace(name)) continue;
                        candidateSkills.Add(new CandidateSkill { CandidateId = cand.Id, Name = name, Years = years });
                    }
                }

                if (candidateSkills.Count > 0)
                {
                    await _candidateRepo.AddSkillsAsync(candidateSkills);
                }

                // register user for candidate using provided password
                try
                {
                    await _authService.RegisterAsync(new RegisterRequest(fullname, email, passwordCell, "Candidate"));
                }
                catch (Exception rex)
                {
                    _logger.LogWarning(rex, "Failed to register user for row {row}: {Email}", r, email);
                    result.Errors.Add($"Row {r}: Failed to register user: {rex.Message}");
                    continue;
                }

                result.CreatedCount++;

                // Matching: for each job, if any required skill matches candidate skill with years >= minYears then link
                var linked = 0;
                var candidateSkillLookup = candidateSkills.ToDictionary(s => s.Name, StringComparer.OrdinalIgnoreCase);

                foreach (var job in jobs)
                {
                    bool matches = false;
                    foreach (var req in job.RequiredSkills)
                    {
                        if (candidateSkillLookup.TryGetValue(req.Name, out var cs))
                        {
                            if (cs.Years >= req.MinYears)
                            {
                                matches = true;
                                break;
                            }
                        }
                    }

                    if (matches)
                    {
                        // Avoid duplicate links
                        var already = await _candidateRepo.HasJobLinkAsync(cand.Id, job.Id);
                        if (!already)
                        {
                            await _candidateRepo.AddJobLinkAsync(new CandidateJob { CandidateId = cand.Id, JobId = job.Id });
                            linked++;
                        }
                    }
                }

                result.LinkedCount += linked;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing row {row}", r);
                result.Errors.Add($"Row {r}: {ex.Message}");
            }
        }

        if (result.Errors.Count == 0)
        {
            await _candidateRepo.CommitTransactionAsync(ct);
        }
        else
        {
            await _candidateRepo.RollbackTransactionAsync(ct);
        }

        return result;
    }
}
