using RecruitmentSystemAPI.Models;
using RecruitmentSystemAPI.Data;
using RecruitmentSystemAPI.DTOs;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;
using OfficeOpenXml;
using RecruitmentSystemAPI.Services.Interfaces;

namespace RecruitmentSystemAPI.Services.Implementations;

public class CandidateService : ICandidateService
{
    private readonly AppDbContext _db;
    private readonly IWebHostEnvironment _env;
    private readonly ILogger<CandidateService> _logger;
    private readonly IAuthService _authService;
    private readonly StatusService _statusService;

    static CandidateService()
    {
        ExcelPackage.LicenseContext = LicenseContext.NonCommercial;
    }

    public CandidateService(AppDbContext db, IWebHostEnvironment env, ILogger<CandidateService> logger, IAuthService authService, StatusService statusService)
    {
        _db = db;
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
            if (await _db.Candidates.AnyAsync(c => c.Email == dto.Email))
                throw new ArgumentException("User already exists");
            if (await _authService.GetUserByEmailAsync(dto.Email) != null)
                throw new ArgumentException("User already exists");

            var candidate = new Candidate
            {
                FullName = dto.FullName,
                Email = dto.Email,
                Phone = dto.Phone
            };

            _db.Candidates.Add(candidate);
            await _db.SaveChangesAsync(ct);  // to get candidate.Id

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
                    _db.CandidateSkills.AddRange(candidateSkills);
                    await _db.SaveChangesAsync(ct);
                }
            }

            if (file is not null && file.Length > 0)
            {
                // treat this upload as a resume; remove any prior resume docs
                var uploadsRoot = Path.Combine(_env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads", "documents", candidate.Id.ToString());
                Directory.CreateDirectory(uploadsRoot);

                // Before saving, remove previous resume files (heuristic: Type == "Resume" or filename contains "resume")
                var prevResumes = await _db.CandidateDocuments.Where(d => d.CandidateId == candidate.Id && (d.FileName.ToLower().Contains("resume") )).ToListAsync(ct);
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
                    _db.CandidateDocuments.Remove(pr);
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

                _db.CandidateDocuments.Add(doc);
                await _db.SaveChangesAsync(ct);
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
                    throw new ArgumentException("User already exists");
                }
            }

            // reload with documents and skills
            return await _db.Candidates
                         .Include(c => c.Documents)
                         .Include(c => c.Skills)
                         .AsNoTracking()
                         .FirstAsync(c => c.Id == candidate.Id, ct);
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
        return await _db.Candidates.Include(c => c.Documents).OrderByDescending(c => c.CreatedAt).ToListAsync();
    }

    public async Task<Candidate?> GetAsync(int id)
    {
        return await _db.Candidates
                        .Include(c => c.Documents)
                        .Include(c => c.Skills)
                        .Include(c => c.CandidateJobs)
                            .ThenInclude(cj => cj.Job)
                        .AsNoTracking()
                        .FirstOrDefaultAsync(c => c.Id == id);
    }

    public async Task<Candidate?> GetByEmailAsync(string email)
    {
        if (string.IsNullOrWhiteSpace(email)) return null;
        return await _db.Candidates
                        .Include(c => c.Documents)
                        .Include(c => c.Skills)
                        .Include(c => c.CandidateJobs)
                        .AsNoTracking()
                        .FirstOrDefaultAsync(c => c.Email == email);
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

    public async Task<IEnumerable<Offer>> GetOffersForCandidateAsync(int candidateId)
    {
        return await _db.Offers
                        .Where(o => o.CandidateId == candidateId)
                        .OrderByDescending(o => o.CreatedAt)
                        .AsNoTracking()
                        .ToListAsync();
    }

    public async Task<IEnumerable<StatusHistory>> GetStatusHistoryForCandidateAsync(int candidateId)
    {
        return await _db.StatusHistories
                        .Where(s => s.CandidateId == candidateId)
                        .OrderByDescending(s => s.Id)
                        .AsNoTracking()
                        .ToListAsync();
    }

    public async Task<CandidateDocument> UploadDocumentAsync(int candidateId, IFormFile file, string? type = null, CancellationToken ct = default)
    {
        if (file == null || file.Length == 0) throw new ArgumentException("File is required");

        // If uploading a resume (type == "Resume"), remove previous resume docs
        if (!string.IsNullOrWhiteSpace(type) && string.Equals(type, "Resume", StringComparison.OrdinalIgnoreCase))
        {
            var prevResumes = await _db.CandidateDocuments.Where(d => d.CandidateId == candidateId && (d.FileName.ToLower().Contains("resume") || d.FilePath.ToLower().Contains("resume"))).ToListAsync(ct);
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
                _db.CandidateDocuments.Remove(pr);
            }
            await _db.SaveChangesAsync(ct);
        }
        var candidate = await _db.Candidates.FindAsync(new object[] { candidateId }, ct);
        if (candidate == null) throw new ArgumentException("Candidate not found");

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

        _db.CandidateDocuments.Add(doc);
        await _db.SaveChangesAsync(ct);

        return doc;
    }

    // Move candidate to HR stage (called by recruiter after reviewing feedback)
    public async Task MoveCandidateToHrAsync(int candidateId, string actor)
    {
        var cand = await _db.Candidates.FindAsync(candidateId);
        if (cand == null) throw new ArgumentException("Candidate not found");

        var latest = await _db.StatusHistories
            .Where(s => s.CandidateId == candidateId)
            .OrderByDescending(s => s.ChangedAt)
            .Select(s => s.NewStatus)
            .FirstOrDefaultAsync();

        var oldStatus = latest ?? "Applied";
        await _statusService.ChangeCandidateStatusAsync(candidateId, oldStatus, "HR", actor);
    }

    public async Task AddSkillsForCandidateAsync(int candidateId, List<CandidateSkill> skills)
    {
        var candidate = await _db.Candidates.Include(c => c.Skills).FirstOrDefaultAsync(c => c.Id == candidateId);
        if (candidate == null) throw new ArgumentException("Candidate not found");

        foreach (var sk in skills)
        {
            if (candidate.Skills.Any(s => s.Name.Equals(sk.Name, StringComparison.OrdinalIgnoreCase))) continue;
            sk.CandidateId = candidateId;
            _db.CandidateSkills.Add(sk);
        }
        await _db.SaveChangesAsync();
    }

    public async Task UpdateSkillsForCandidateAsync(int candidateId, List<CandidateSkill> skills)
    {
        var candidate = await _db.Candidates.Include(c => c.Skills).FirstOrDefaultAsync(c => c.Id == candidateId);
        if (candidate == null) throw new ArgumentException("Candidate not found");

        foreach (var sk in skills)
        {
            if (sk.Id != 0)
            {
                var existing = candidate.Skills.FirstOrDefault(s => s.Id == sk.Id);
                if (existing == null) throw new ArgumentException($"Skill with id {sk.Id} not found");
                existing.Name = sk.Name ?? existing.Name;
                existing.Years = sk.Years;
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
                    sk.CandidateId = candidateId;
                    _db.CandidateSkills.Add(sk);
                }
            }
        }

        await _db.SaveChangesAsync();
    }

    public async Task RemoveSkillAsync(int candidateId, int skillId)
    {
        var skill = await _db.CandidateSkills.FirstOrDefaultAsync(s => s.Id == skillId && s.CandidateId == candidateId);
        if (skill == null) throw new ArgumentException("Skill not found");
        _db.CandidateSkills.Remove(skill);
        await _db.SaveChangesAsync();
    }

    public async Task<Candidate> UpdateCandidateAsync(int candidateId, UpdateCandidateRequest req)
    {
        var candidate = await _db.Candidates.Include(c => c.Documents).Include(c => c.Skills).FirstOrDefaultAsync(c => c.Id == candidateId);
        if (candidate == null) throw new ArgumentException("Candidate not found");

        // Only allow updating certain fields for now. Ignore nulls.
        if (req.Phone is not null)
        {
            candidate.Phone = req.Phone;
        }

        await _db.SaveChangesAsync();

        // Return a detached copy with related collections
        return await _db.Candidates.Include(c => c.Documents).Include(c => c.Skills).AsNoTracking().FirstAsync(c => c.Id == candidateId);
    }

    public async Task<IEnumerable<Candidate>> GetCandidatesAtStageAsync(string stage)
    {
        // Compute latest status per candidate using group max then pick the row with that timestamp
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

    public async Task<IEnumerable<CandidateDocument>> GetCandidateDocumentsAsync(int candidateId)
    {
        return await _db.CandidateDocuments
                        .Where(d => d.CandidateId == candidateId)
                        .AsNoTracking()
                        .ToListAsync();
    }

    public async Task<CandidateDocument> VerifyDocumentAsync(int candidateId, int documentId, bool verified)
    {
        var doc = await _db.CandidateDocuments.FirstOrDefaultAsync(d => d.Id == documentId && d.CandidateId == candidateId);
        if (doc == null) throw new ArgumentException("Document not found");
        doc.Verified = verified;
        await _db.SaveChangesAsync();
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
        var jobs = await _db.Jobs.Include(j => j.RequiredSkills).ToListAsync(ct);

        using var trx = await _db.Database.BeginTransactionAsync(ct);

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
                if (await _db.Candidates.AnyAsync(c => c.Email == email, ct) || await _db.Users.AnyAsync(u => u.Email == email, ct))
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
                _db.Candidates.Add(cand);
                await _db.SaveChangesAsync(ct); // to get cand.Id

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
                    _db.CandidateSkills.AddRange(candidateSkills);
                    await _db.SaveChangesAsync(ct);
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
                        var already = await _db.CandidateJobs.AnyAsync(cj => cj.CandidateId == cand.Id && cj.JobId == job.Id, ct);
                        if (!already)
                        {
                            _db.CandidateJobs.Add(new CandidateJob { CandidateId = cand.Id, JobId = job.Id });
                            linked++;
                        }
                    }
                }

                if (linked > 0) await _db.SaveChangesAsync(ct);
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
            await trx.CommitAsync(ct);
        }
        else
        {
            await trx.RollbackAsync(ct);
        }

        return result;
    }
}
