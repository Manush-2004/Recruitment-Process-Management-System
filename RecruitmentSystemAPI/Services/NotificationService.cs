using Microsoft.AspNetCore.SignalR;
using RecruitmentSystemAPI.Hubs;

public class NotificationService : INotificationService
{
    private readonly IHubContext<NotificationHub> _hub;

    public NotificationService(IHubContext<NotificationHub> hub)
    {
        _hub = hub;
    }

    // Broadcast to all connected clients (legacy behavior)
    public async Task NotifyAsync(string message)
    {
        await _hub.Clients.All.SendAsync("ReceiveNotification", message);
    }

    // Send to a specific user group identified by email
    public async Task SendToUserEmailAsync(string email, string message)
    {
        if (string.IsNullOrWhiteSpace(email)) return;
        var group = $"user:{email}";
        await _hub.Clients.Group(group).SendAsync("ReceiveNotification", message);
    }

    // Send to a role group (e.g., "HR", "Recruiter")
    public async Task SendToRoleAsync(string role, string message)
    {
        if (string.IsNullOrWhiteSpace(role)) return;
        var group = $"role:{role}";
        await _hub.Clients.Group(group).SendAsync("ReceiveNotification", message);
    }
}
