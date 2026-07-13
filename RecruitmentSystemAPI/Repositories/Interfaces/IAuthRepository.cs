using RecruitmentSystemAPI.Models;

namespace RecruitmentSystemAPI.Repositories.Interfaces;

public interface IAuthRepository
{
    Task<bool> UserExistsAsync(string email);
    Task<Role> GetOrCreateRoleAsync(string roleName);
    Task AddUserAsync(User user);
    Task<User?> GetUserByIdAsync(int id);
    Task<User?> GetUserByEmailWithRolesAsync(string email);
}
