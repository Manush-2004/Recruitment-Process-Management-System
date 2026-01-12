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

    public async Task<User> CreateUserAsync(string fullName, string email, string password, string role, string? phone = null)
    {
        // reuse AuthService registration logic
        var token = await _authService.RegisterAsync(new RegisterRequest(fullName, email, password, role));
        // After registration, read created user
        var user = await _db.Users.Include(u => u.UserRoles).ThenInclude(ur => ur.Role).FirstOrDefaultAsync(u => u.Email == email);
        if (user == null) throw new Exception("User creation failed");

        // If this is a Candidate user, ensure a Candidate profile exists and set phone if provided
        if (string.Equals(role, "Candidate", StringComparison.OrdinalIgnoreCase))
        {
            var existing = await _db.Candidates.FirstOrDefaultAsync(c => c.Email == email);
            if (existing == null)
            {
                var cand = new Candidate { FullName = fullName, Email = email, Phone = phone };
                _db.Candidates.Add(cand);
                await _db.SaveChangesAsync();
            }
            else if (!string.IsNullOrWhiteSpace(phone) && string.IsNullOrWhiteSpace(existing.Phone))
            {
                existing.Phone = phone;
                await _db.SaveChangesAsync();
            }
        }

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

    public async Task ClearAllUsersAsync()
    {
        // Remove all user-roles and users (useful for test/dev reset).
        // Additionally, remove candidate-related data so that clearing users results in no candidates visible.
        using var trx = await _db.Database.BeginTransactionAsync();
        try
        {
            // Delete candidate-related entities first (to avoid FK issues)
            // Delete candidate documents and attempt to delete their files from disk (best-effort)
            var docs = await _db.CandidateDocuments.ToListAsync();
            foreach (var d in docs)
            {
                try
                {
                    var path = d.FilePath?.TrimStart('/')?.Replace('/', System.IO.Path.DirectorySeparatorChar);
                    if (!string.IsNullOrWhiteSpace(path))
                    {
                        var absolute = System.IO.Path.Combine(System.IO.Directory.GetCurrentDirectory(), "wwwroot", path);
                        if (System.IO.File.Exists(absolute)) System.IO.File.Delete(absolute);
                    }
                }
                catch (Exception ex)
                {
                    // Log but do not abort
                    Console.WriteLine("Failed to delete file " + ex.Message);
                }
            }
            _db.CandidateDocuments.RemoveRange(_db.CandidateDocuments);

            _db.CandidateSkills.RemoveRange(_db.CandidateSkills);
            _db.CandidateJobs.RemoveRange(_db.CandidateJobs);
            _db.Screenings.RemoveRange(_db.Screenings.Where(s => s.CandidateId != 0));
            _db.Interviews.RemoveRange(_db.Interviews.Where(i => i.CandidateId != 0));
            _db.Offers.RemoveRange(_db.Offers.Where(o => o.CandidateId != 0));
            _db.StatusHistories.RemoveRange(_db.StatusHistories.Where(sh => sh.CandidateId != 0));

            _db.Candidates.RemoveRange(_db.Candidates);

            // Now remove users and user roles
            _db.UserRoles.RemoveRange(_db.UserRoles);
            _db.Users.RemoveRange(_db.Users);

            await _db.SaveChangesAsync();
            await trx.CommitAsync();
        }
        catch
        {
            await trx.RollbackAsync();
            throw;
        }
    }
}