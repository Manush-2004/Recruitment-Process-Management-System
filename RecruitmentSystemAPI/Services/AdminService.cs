using Microsoft.EntityFrameworkCore;
using RecruitmentSystemAPI.Data;
using RecruitmentSystemAPI.Models;

public class AdminService : IAdminService
{
    private readonly AppDbContext _db;
    private readonly IAuthService _authService;

    public AdminService(AppDbContext db, IAuthService authService)
    {
        _db = db;
        _authService = authService;
    }

    public async Task<IEnumerable<object>> GetUsersAsync()
    {
        var users = await _db.Users.Include(u => u.UserRoles).ThenInclude(ur => ur.Role).ToListAsync();
        return users.Select(u => new {
            id = u.Id,
            fullName = u.FullName,
            email = u.Email,
            roles = u.UserRoles.Select(ur => ur.Role!.Name).ToList(),
            isActive = true // extension point - currently always active
        });
    }

    public async Task<User> CreateUserAsync(string fullName, string email, string password, string role)
    {
        // reuse AuthService registration logic
        var token = await _authService.RegisterAsync(new RegisterRequest(fullName, email, password, role));
        // After registration, read created user
        var user = await _db.Users.Include(u => u.UserRoles).ThenInclude(ur => ur.Role).FirstOrDefaultAsync(u => u.Email == email);
        if (user == null) throw new Exception("User creation failed");
        return user;
    }

    public async Task<User?> UpdateUserAsync(int userId, string? fullName, bool? isActive)
    {
        var user = await _db.Users.FindAsync(userId);
        if (user == null) return null;
        if (!string.IsNullOrWhiteSpace(fullName)) user.FullName = fullName;
        // isActive is not persisted yet; placeholder
        await _db.SaveChangesAsync();
        return user;
    }

    public async Task AssignRoleAsync(int userId, string roleName)
    {
        var user = await _db.Users.Include(u => u.UserRoles).FirstOrDefaultAsync(u => u.Id == userId);
        if (user == null) throw new Exception("User not found");
        var role = await _db.Roles.FirstOrDefaultAsync(r => r.Name == roleName) ?? new Role { Name = roleName };
        if (!user.UserRoles.Any(ur => ur.RoleId == role.Id))
        {
            user.UserRoles.Add(new UserRole { User = user, Role = role });
            await _db.SaveChangesAsync();
        }
    }

    public async Task RemoveRoleAsync(int userId, string roleName)
    {
        var user = await _db.Users.Include(u => u.UserRoles).ThenInclude(ur => ur.Role).FirstOrDefaultAsync(u => u.Id == userId);
        if (user == null) throw new Exception("User not found");
        var ur = user.UserRoles.FirstOrDefault(x => x.Role!.Name == roleName);
        if (ur != null)
        {
            _db.UserRoles.Remove(ur);
            await _db.SaveChangesAsync();
        }
    }

    public async Task<IEnumerable<string>> GetRolesAsync()
    {
        return await _db.Roles.Select(r => r.Name).ToListAsync();
    }

    public async Task<string> CreateRoleAsync(string roleName)
    {
        var existing = await _db.Roles.FirstOrDefaultAsync(r => r.Name == roleName);
        if (existing != null) return existing.Name;
        var role = new Role { Name = roleName };
        _db.Roles.Add(role);
        await _db.SaveChangesAsync();
        return role.Name;
    }
}