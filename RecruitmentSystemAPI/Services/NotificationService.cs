using Microsoft.AspNetCore.SignalR;
using RecruitmentSystemAPI.Hubs;

public class NotificationService : INotificationService
{
    private readonly IHubContext<NotificationHub> _hub;

    public NotificationService(IHubContext<NotificationHub> hub)
    {
        _hub = hub;
    }

    public async Task NotifyAsync(string message)
    {
        await _hub.Clients.All.SendAsync("ReceiveNotification", message);
    }
}
