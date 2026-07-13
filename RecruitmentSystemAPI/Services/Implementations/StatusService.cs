using RecruitmentSystemAPI.Models;
using Microsoft.EntityFrameworkCore;
using RecruitmentSystemAPI.Services.Interfaces;
using RecruitmentSystemAPI.Repositories.Interfaces;

namespace RecruitmentSystemAPI.Services.Implementations;

public class StatusService
{
    private readonly IStatusRepository _statusRepo;
    private readonly ICandidateRepository _candidateRepo;
    private readonly INotificationService _notify;
    private readonly IAuthRepository _authRepo;

    public StatusService(IStatusRepository statusRepo, ICandidateRepository candidateRepo, INotificationService notify, IAuthRepository authRepo)
    {
        _statusRepo = statusRepo;
        _candidateRepo = candidateRepo;
        _notify = notify;
        _authRepo = authRepo;
    }

    public async Task ChangeCandidateStatusAsync(
        int candidateId,
        string oldStatus,
        string newStatus,
        string changedBy)
    {
        var history = new StatusHistory
        {
            CandidateId = candidateId,
            OldStatus = oldStatus,
            NewStatus = newStatus,
            ChangedBy = changedBy,
            // Explicitly set ChangedAt as Unspecified to preserve exact time without timezone conversion
            ChangedAt = DateTime.SpecifyKind(DateTime.Now, DateTimeKind.Unspecified)
        };

        await _statusRepo.AddStatusHistoryAsync(history);

        var message = $"Candidate {candidateId}: {oldStatus} → {newStatus}";

        // Notify Recruiter and HR roles
        try { await _notify.SendToRoleAsync("Recruiter", message); } catch {};
        try { await _notify.SendToRoleAsync("HR", message); } catch {};

        // Also attempt to notify the candidate user (if an account exists)
        try
        {
            var candidate = await _candidateRepo.GetByIdAsync(candidateId);
            if (candidate != null)
            {
                var user = await _authRepo.GetUserByEmailWithRolesAsync(candidate.Email);
                if (user != null)
                {
                    await _notify.SendToUserEmailAsync(user.Email, message);
                }
            }
        }
        catch { /* swallow to avoid breaking primary flow */ }

    }
}
