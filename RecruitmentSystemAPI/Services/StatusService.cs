using RecruitmentSystemAPI.Data;
using RecruitmentSystemAPI.Models;
using Microsoft.EntityFrameworkCore;

public class StatusService
{
    private readonly AppDbContext _db;
    private readonly INotificationService _notify;

    public StatusService(AppDbContext db, INotificationService notify)
    {
        _db = db;
        _notify = notify;
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

        _db.StatusHistories.Add(history);
        await _db.SaveChangesAsync();

        var message = $"Candidate {candidateId}: {oldStatus} → {newStatus}";

        // Notify Recruiter and HR roles
        try { await _notify.SendToRoleAsync("Recruiter", message); } catch {};
        try { await _notify.SendToRoleAsync("HR", message); } catch {};

        // Also attempt to notify the candidate user (if an account exists)
        try
        {
            var candidate = await _db.Candidates.FindAsync(candidateId);
            if (candidate != null)
            {
                var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == candidate.Email);
                if (user != null)
                {
                    await _notify.SendToUserEmailAsync(user.Email, message);
                }
            }
        }
        catch { /* swallow to avoid breaking primary flow */ }

    }
}
