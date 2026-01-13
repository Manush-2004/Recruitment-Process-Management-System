using RecruitmentSystemAPI.Data;
using RecruitmentSystemAPI.Models;
using Microsoft.EntityFrameworkCore;

public class ScreeningService : IScreeningService
{
    private readonly AppDbContext _db;
    private readonly StatusService _statusService;

    public ScreeningService(AppDbContext db, StatusService statusService)
    {
        _db = db;
        _statusService = statusService;
    }

    public async Task<bool> AlreadyScreenedAsync(int candidateId, int jobId)
    {
        // Consider a candidate already screened only if there exists a completed screening (i.e., ScreenedAt set or Status != "Pending")
        return await _db.Screenings
            .AnyAsync(s => s.CandidateId == candidateId && s.JobId == jobId && (s.ScreenedAt != null || s.Status != "Pending"));
    }

    public async Task<Screening> ScreenCandidateAsync(ScreeningRequest request)
    {
        // If there is a completed screening, block further submissions
        if (await AlreadyScreenedAsync(request.CandidateId, request.JobId))
            throw new Exception("Candidate already screened for this job.");

        // Check for existing pending assignment for this candidate/job and reviewer (reviewer-based flow)
        var existingPending = await _db.Screenings.FirstOrDefaultAsync(s => s.CandidateId == request.CandidateId && s.JobId == request.JobId && s.Status == "Pending" && s.ReviewerName == request.ReviewerName);

        if (existingPending != null)
        {
            // Reviewer is submitting result for an assigned screening — update the existing record
            existingPending.Status = request.Status;
            existingPending.Comments = request.Comments;
            existingPending.ScreenedAt = DateTime.UtcNow;

            // Replace skills: remove existing and add new ones
            var existingSkills = _db.ScreeningSkills.Where(ss => ss.ScreeningId == existingPending.Id);
            _db.ScreeningSkills.RemoveRange(existingSkills);
            existingPending.Skills = (request.Skills ?? new List<ScreeningSkillRequest>()).Select(s => new ScreeningSkill
            {
                SkillName = s.SkillName,
                YearsOfExperience = s.YearsOfExperience,
                IsApproved = s.IsApproved
            }).ToList();

            await _db.SaveChangesAsync();

            // Only change candidate status if a non-Pending status was provided
            if (!string.IsNullOrEmpty(request.Status) && request.Status != "Pending")
            {
                await _statusService.ChangeCandidateStatusAsync(request.CandidateId, "Applied", request.Status, request.ReviewerName);
            }
            return existingPending;
        }
        // No pending assigned screening — create new screening. For recruiter-assigned (status may be null), treat null as Pending.
        var screening = new Screening
        {
            CandidateId = request.CandidateId,
            JobId = request.JobId,
            ReviewerName = request.ReviewerName,
            Status = request.Status ?? "Pending",
            Comments = request.Comments,
            Skills = (request.Skills ?? new List<ScreeningSkillRequest>()).Select(s => new ScreeningSkill
            {
                SkillName = s.SkillName,
                YearsOfExperience = s.YearsOfExperience,
                IsApproved = s.IsApproved
            }).ToList(),
            ScreenedAt = (request.Status != null && request.Status != "Pending") ? DateTime.UtcNow : (DateTime?)null
        };

        _db.Screenings.Add(screening);
        await _db.SaveChangesAsync();
        if (screening.ScreenedAt != null)
        {
            await _statusService.ChangeCandidateStatusAsync(
                request.CandidateId,
                "Applied",
                screening.Status,
                request.ReviewerName
            );
        }
        return screening;
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

    // Allow updating an existing screening's status/comments/skills. Reviewers can only update their own screenings (enforced by controller/service). Recruiters/Admins may update any screening.
    public async Task<Screening> UpdateScreeningAsync(int screeningId, UpdateScreeningRequest request, string? callerName = null, bool asReviewer = false)
    {
        var screening = await _db.Screenings.Include(s => s.Skills).FirstOrDefaultAsync(s => s.Id == screeningId);
        if (screening == null) throw new KeyNotFoundException("Screening not found");

        // If caller is a reviewer, ensure they are the assigned reviewer
        if (asReviewer && !string.Equals(screening.ReviewerName, callerName, StringComparison.OrdinalIgnoreCase))
            throw new UnauthorizedAccessException("Reviewer may only modify their own screenings");

        var statusChanged = false;

        if (request.Status != null && request.Status != screening.Status)
        {
            screening.Status = request.Status;
            statusChanged = true;
            // If status becomes non-Pending and ScreenedAt not set, set it (indicates completion)
            if (!string.Equals(request.Status, "Pending", StringComparison.OrdinalIgnoreCase) && screening.ScreenedAt == null)
                screening.ScreenedAt = DateTime.UtcNow;
            // If status becomes Pending explicitly, clear ScreenedAt
            if (string.Equals(request.Status, "Pending", StringComparison.OrdinalIgnoreCase))
                screening.ScreenedAt = null;
        }

        if (request.Comments != null) screening.Comments = request.Comments;

        if (request.Skills != null)
        {
            // replace skills
            var existing = _db.ScreeningSkills.Where(ss => ss.ScreeningId == screening.Id);
            _db.ScreeningSkills.RemoveRange(existing);
            screening.Skills = request.Skills.Select(s => new ScreeningSkill
            {
                SkillName = s.SkillName,
                YearsOfExperience = s.YearsOfExperience,
                IsApproved = s.IsApproved
            }).ToList();
        }

        await _db.SaveChangesAsync();

        if (statusChanged && screening.ScreenedAt != null)
        {
            await _statusService.ChangeCandidateStatusAsync(screening.CandidateId, "Applied", screening.Status, screening.ReviewerName);
        }

        return screening;
    }
}
