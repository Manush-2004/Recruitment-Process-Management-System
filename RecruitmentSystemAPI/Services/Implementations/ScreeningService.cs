using RecruitmentSystemAPI.DTOs;
using RecruitmentSystemAPI.Exceptions;
using RecruitmentSystemAPI.Models;
using RecruitmentSystemAPI.Repositories.Interfaces;
using RecruitmentSystemAPI.Services.Interfaces;

namespace RecruitmentSystemAPI.Services.Implementations;

public class ScreeningService : IScreeningService
{
    private readonly IScreeningRepository _screeningRepo;
    private readonly StatusService _statusService;

    public ScreeningService(IScreeningRepository screeningRepo, StatusService statusService)
    {
        _screeningRepo = screeningRepo;
        _statusService = statusService;
    }

    public async Task<bool> AlreadyScreenedAsync(int candidateId, int jobId)
    {
        return await _screeningRepo.HasCompletedScreeningAsync(candidateId, jobId);
    }

    public async Task<Screening> ScreenCandidateAsync(ScreeningRequest request)
    {
        // If there is a completed screening, block further submissions
        if (await AlreadyScreenedAsync(request.CandidateId, request.JobId))
            throw new ConflictException("Candidate already screened for this job.");

        // Check for existing pending assignment for this candidate/job and reviewer (reviewer-based flow)
        var existingPending = await _screeningRepo.GetPendingScreeningAsync(request.CandidateId, request.JobId, request.ReviewerName);

        if (existingPending != null)
        {
            // Reviewer is submitting result for an assigned screening — update the existing record
            existingPending.Status = request.Status;
            existingPending.Comments = request.Comments;
            existingPending.ScreenedAt = DateTime.UtcNow;

            // Replace skills: remove existing and add new ones
            var newSkills = (request.Skills ?? new List<ScreeningSkillRequest>()).Select(s => new ScreeningSkill
            {
                SkillName = s.SkillName,
                YearsOfExperience = s.YearsOfExperience,
                IsApproved = s.IsApproved
            }).ToList();
            
            await _screeningRepo.UpdateScreeningAndSkillsAsync(existingPending, newSkills);

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

        await _screeningRepo.AddScreeningAsync(screening);
        
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
        return await _screeningRepo.GetAssignedForReviewerAsync(reviewerName);
    }

    public async Task<IEnumerable<Screening>> GetHistoryForReviewerAsync(string reviewerName)
    {
        return await _screeningRepo.GetHistoryForReviewerAsync(reviewerName);
    }

    public async Task<IEnumerable<Screening>> GetForCandidateAsync(int candidateId)
    {
        return await _screeningRepo.GetForCandidateAsync(candidateId);
    }

    // Allow updating an existing screening's status/comments/skills. Reviewers can only update their own screenings (enforced by controller/service). Recruiters/Admins may update any screening.
    public async Task<Screening> UpdateScreeningAsync(int screeningId, UpdateScreeningRequest request, string? callerName = null, bool asReviewer = false)
    {
        var screening = await _screeningRepo.GetByIdWithSkillsAsync(screeningId);
        if (screening == null) throw new NotFoundException("Screening not found");

        // If caller is a reviewer, ensure they are the assigned reviewer
        if (asReviewer && !string.Equals(screening.ReviewerName, callerName, StringComparison.OrdinalIgnoreCase))
            throw new ForbiddenException("Reviewer may only modify their own screenings");

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

        var newSkills = screening.Skills.ToList(); // preserve existing if not provided
        if (request.Skills != null)
        {
            // replace skills
            newSkills = request.Skills.Select(s => new ScreeningSkill
            {
                SkillName = s.SkillName,
                YearsOfExperience = s.YearsOfExperience,
                IsApproved = s.IsApproved
            }).ToList();
        }

        await _screeningRepo.UpdateScreeningAndSkillsAsync(screening, newSkills);

        if (statusChanged && screening.ScreenedAt != null)
        {
            await _statusService.ChangeCandidateStatusAsync(screening.CandidateId, "Applied", screening.Status, screening.ReviewerName);
        }

        return screening;
    }
}
