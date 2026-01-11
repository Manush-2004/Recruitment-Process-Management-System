using RecruitmentSystemAPI.Models;

public interface IAdminService
{
    Task<IEnumerable<object>> GetUsersAsync();
    Task<User> CreateUserAsync(string fullName, string email, string password, string role);
    Task<User?> UpdateUserAsync(int userId, string? fullName, bool? isActive);
    Task AssignRoleAsync(int userId, string roleName);
    Task RemoveRoleAsync(int userId, string roleName);
    Task<IEnumerable<string>> GetRolesAsync();
    Task<string> CreateRoleAsync(string roleName);
}