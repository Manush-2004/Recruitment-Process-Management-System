using RecruitmentSystemAPI.Data;
using RecruitmentSystemAPI.Models;

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
            ChangedBy = changedBy
        };

        _db.StatusHistories.Add(history);
        await _db.SaveChangesAsync();

        await _notify.NotifyAsync(
            $"Candidate {candidateId}: {oldStatus} → {newStatus}"
        );
    }
}
