using RecruitmentSystemAPI.Models;

namespace RecruitmentSystemAPI.Repositories.Interfaces;

public interface IAdminRepository
{
    Task<IEnumerable<User>> GetUsersAsync();
    Task<User?> GetUserByIdAsync(int userId);
    Task<User?> GetUserByEmailWithRolesAsync(string email);
    Task UpdateUserAsync(User user);
    Task<User?> GetUserWithRolesByIdAsync(int userId);
    Task<Role?> GetRoleByNameAsync(string roleName);
    Task AddUserRoleAsync(UserRole userRole);
    Task RemoveUserRoleAsync(UserRole userRole);
    Task<IEnumerable<string>> GetRolesAsync();
    Task AddRoleAsync(Role role);
    Task<IEnumerable<string?>> GetAllCandidateDocumentPathsAsync();
    Task ClearAllUsersAndRelatedDataAsync();
}
