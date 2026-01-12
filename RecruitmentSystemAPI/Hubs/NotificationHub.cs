using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace RecruitmentSystemAPI.Hubs;

[Authorize]
public class NotificationHub : Hub
{
    public override async Task OnConnectedAsync()
    {
        // Map authenticated users to groups: by email and by role
        var email = Context.User?.FindFirst(ClaimTypes.Name)?.Value;
        if (!string.IsNullOrWhiteSpace(email))
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"user:{email}");
        }

        var roles = Context.User?.FindAll(ClaimTypes.Role);
        if (roles != null)
        {
            foreach (var r in roles)
            {
                if (!string.IsNullOrWhiteSpace(r.Value))
                    await Groups.AddToGroupAsync(Context.ConnectionId, $"role:{r.Value}");
            }
        }

        await base.OnConnectedAsync();
    }

    // Fallback send method for legacy callers that send via hub directly
    public async Task SendNotification(string message)
    {
        await Clients.All.SendAsync("ReceiveNotification", message);
    }
}
