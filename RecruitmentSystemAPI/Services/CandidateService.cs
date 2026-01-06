using RecruitmentSystemAPI.Models;
using RecruitmentSystemAPI.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;
using OfficeOpenXml;


namespace RecruitmentSystemAPI.Services;

public class CandidateService : ICandidateService
{
    private readonly AppDbContext _db;
    private readonly IWebHostEnvironment _env;
    private readonly ILogger<CandidateService> _logger;

    static CandidateService()
    {
        ExcelPackage.LicenseContext = LicenseContext.NonCommercial;
    }

    public CandidateService(AppDbContext db, IWebHostEnvironment env, ILogger<CandidateService> logger)
    {
        _db = db;
        _env = env;
        _logger = logger;
    }

    public async Task<Candidate> CreateCandidateAsync(CreateCandidateRequest dto, IFormFile? file, CancellationToken ct = default)
    {
        var candidate = new Candidate
        {
            FullName = dto.FullName,
            Email = dto.Email,
            Phone = dto.Phone
        };

        _db.Candidates.Add(candidate);
        await _db.SaveChangesAsync(ct);  // to get candidate.Id

        if (file is not null && file.Length > 0)
        {
            // Ensure uploads folder exists
            var uploadsRoot = Path.Combine(_env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads", "cvs");
            Directory.CreateDirectory(uploadsRoot);

            // sanitize and create filename
            var safeFileName = $"{Guid.NewGuid()}_{Path.GetFileName(file.FileName)}";
            var filePath = Path.Combine(uploadsRoot, safeFileName);

            using (var stream = File.Create(filePath))
            {
                await file.CopyToAsync(stream, ct);
            }

            var relativePath = Path.Combine("uploads", "cvs", safeFileName).Replace("\\", "/");

            var doc = new CandidateDocument
            {
                CandidateId = candidate.Id,
                FileName = file.FileName,
                FilePath = "/" + relativePath, // leading slash so static files serve correctly
                ContentType = file.ContentType ?? "application/octet-stream",
                Size = file.Length
            };

            _db.CandidateDocuments.Add(doc);
            await _db.SaveChangesAsync(ct);
        }

        // reload with documents
        return await _db.Candidates
                     .Include(c => c.Documents)
                     .AsNoTracking()
                     .FirstAsync(c => c.Id == candidate.Id, ct);

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

    public async Task<CandidateDocument> UploadDocumentAsync(int candidateId, IFormFile file, CancellationToken ct = default)
    {
        if (file == null || file.Length == 0) throw new ArgumentException("File is required");

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

        result.TotalRows = rowCount - 1;

        // Load all jobs and their required skills into memory for matching
        var jobs = await _db.Jobs.Include(j => j.RequiredSkills).ToListAsync(ct);

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

        return result;
    }

}