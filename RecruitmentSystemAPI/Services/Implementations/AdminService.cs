using RecruitmentSystemAPI.DTOs;
using RecruitmentSystemAPI.Models;
using RecruitmentSystemAPI.Repositories.Interfaces;
using RecruitmentSystemAPI.Services.Interfaces;

namespace RecruitmentSystemAPI.Services.Implementations;

public class AdminService : IAdminService
{
    private readonly IAdminRepository _adminRepo;
    private readonly ICandidateRepository _candidateRepo;
    private readonly IAuthService _authService;

    public AdminService(IAdminRepository adminRepo, ICandidateRepository candidateRepo, IAuthService authService)
    {
        _adminRepo = adminRepo;
        _candidateRepo = candidateRepo;
        _authService = authService;
    }

    public async Task<IEnumerable<object>> GetUsersAsync()
    {
        var users = await _adminRepo.GetUsersAsync();
        return users.Select(u => new {
            id = u.Id,
            fullName = u.FullName,
            email = u.Email,
            roles = u.UserRoles.Select(ur => ur.Role!.Name).ToList(),
            isActive = true // extension point - currently always active
        });
    }

    public async Task<User> CreateUserAsync(string fullName, string email, string password, string role, string? phone = null)
    {
        // reuse AuthService registration logic
        var token = await _authService.RegisterAsync(new RegisterRequest(fullName, email, password, role));
        // After registration, read created user
        var user = await _adminRepo.GetUserByEmailWithRolesAsync(email);
        if (user == null) throw new Exception("User creation failed");

        // If this is a Candidate user, ensure a Candidate profile exists and set phone if provided
        if (string.Equals(role, "Candidate", StringComparison.OrdinalIgnoreCase))
        {
            var existing = await _candidateRepo.GetByEmailAsync(email);
            if (existing == null)
            {
                var cand = new Candidate { FullName = fullName, Email = email, Phone = phone };
                await _candidateRepo.AddAsync(cand);
            }
            else if (!string.IsNullOrWhiteSpace(phone) && string.IsNullOrWhiteSpace(existing.Phone))
            {
                await _candidateRepo.UpdatePhoneAsync(existing, phone);
            }
        }

        return user;
    }

    public async Task<User?> UpdateUserAsync(int userId, string? fullName, bool? isActive)
    {
        var user = await _adminRepo.GetUserByIdAsync(userId);
        if (user == null) return null;
        if (!string.IsNullOrWhiteSpace(fullName)) user.FullName = fullName;
        // isActive is not persisted yet; placeholder
        await _adminRepo.UpdateUserAsync(user);
        return user;
    }

    public async Task AssignRoleAsync(int userId, string roleName)
    {
        var user = await _adminRepo.GetUserWithRolesByIdAsync(userId);
        if (user == null) throw new Exception("User not found");
        var role = await _adminRepo.GetRoleByNameAsync(roleName) ?? new Role { Name = roleName };
        if (!user.UserRoles.Any(ur => ur.RoleId == role.Id || ur.Role?.Name == roleName))
        {
            await _adminRepo.AddUserRoleAsync(new UserRole { User = user, Role = role });
        }
    }

    public async Task RemoveRoleAsync(int userId, string roleName)
    {
        var user = await _adminRepo.GetUserWithRolesByIdAsync(userId);
        if (user == null) throw new Exception("User not found");
        var ur = user.UserRoles.FirstOrDefault(x => x.Role!.Name == roleName);
        if (ur != null)
        {
            await _adminRepo.RemoveUserRoleAsync(ur);
        }
    }

    public async Task<IEnumerable<string>> GetRolesAsync()
    {
        return await _adminRepo.GetRolesAsync();
    }

    public async Task<string> CreateRoleAsync(string roleName)
    {
        var existing = await _adminRepo.GetRoleByNameAsync(roleName);
        if (existing != null) return existing.Name;
        var role = new Role { Name = roleName };
        await _adminRepo.AddRoleAsync(role);
        return role.Name;
    }

    public async Task ClearAllUsersAsync()
    {
        // Remove all user-roles and users (useful for test/dev reset).
        // Additionally, remove candidate-related data so that clearing users results in no candidates visible.
        
        // Delete candidate documents and attempt to delete their files from disk (best-effort)
        var paths = await _adminRepo.GetAllCandidateDocumentPathsAsync();
        foreach (var path in paths)
        {
            try
            {
                var cleanPath = path?.TrimStart('/')?.Replace('/', System.IO.Path.DirectorySeparatorChar);
                if (!string.IsNullOrWhiteSpace(cleanPath))
                {
                    var absolute = System.IO.Path.Combine(System.IO.Directory.GetCurrentDirectory(), "wwwroot", cleanPath);
                    if (System.IO.File.Exists(absolute)) System.IO.File.Delete(absolute);
                }
            }
            catch (Exception ex)
            {
                // Log but do not abort
                Console.WriteLine("Failed to delete file " + ex.Message);
            }
        }

        await _adminRepo.ClearAllUsersAndRelatedDataAsync();
    }
}