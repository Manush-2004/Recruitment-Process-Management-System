namespace RecruitmentSystemAPI.Services.Interfaces;

public interface INotificationService
{
    Task NotifyAsync(string message);
    Task SendToUserEmailAsync(string email, string message);
    Task SendToRoleAsync(string role, string message);
}
