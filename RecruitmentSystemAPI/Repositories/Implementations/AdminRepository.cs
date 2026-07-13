using Microsoft.EntityFrameworkCore;
using RecruitmentSystemAPI.Data;
using RecruitmentSystemAPI.Models;
using RecruitmentSystemAPI.Repositories.Interfaces;

namespace RecruitmentSystemAPI.Repositories.Implementations;

public class AdminRepository : IAdminRepository
{
    private readonly AppDbContext _db;

    public AdminRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task<IEnumerable<User>> GetUsersAsync()
    {
        return await _db.Users.Include(u => u.UserRoles).ThenInclude(ur => ur.Role).ToListAsync();
    }

    public async Task<User?> GetUserByIdAsync(int userId)
    {
        return await _db.Users.FindAsync(userId);
    }

    public async Task<User?> GetUserByEmailWithRolesAsync(string email)
    {
        return await _db.Users.Include(u => u.UserRoles).ThenInclude(ur => ur.Role).FirstOrDefaultAsync(u => u.Email == email);
    }

    public async Task UpdateUserAsync(User user)
    {
        // EF Core tracks this, just save changes
        await _db.SaveChangesAsync();
    }

    public async Task<User?> GetUserWithRolesByIdAsync(int userId)
    {
        return await _db.Users.Include(u => u.UserRoles).ThenInclude(ur => ur.Role).FirstOrDefaultAsync(u => u.Id == userId);
    }

    public async Task<Role?> GetRoleByNameAsync(string roleName)
    {
        return await _db.Roles.FirstOrDefaultAsync(r => r.Name == roleName);
    }

    public async Task AddUserRoleAsync(UserRole userRole)
    {
        _db.UserRoles.Add(userRole);
        await _db.SaveChangesAsync();
    }

    public async Task RemoveUserRoleAsync(UserRole userRole)
    {
        _db.UserRoles.Remove(userRole);
        await _db.SaveChangesAsync();
    }

    public async Task<IEnumerable<string>> GetRolesAsync()
    {
        return await _db.Roles.Select(r => r.Name).ToListAsync();
    }

    public async Task AddRoleAsync(Role role)
    {
        _db.Roles.Add(role);
        await _db.SaveChangesAsync();
    }

    public async Task<IEnumerable<string?>> GetAllCandidateDocumentPathsAsync()
    {
        return await _db.CandidateDocuments.Select(d => d.FilePath).ToListAsync();
    }

    public async Task ClearAllUsersAndRelatedDataAsync()
    {
        using var trx = await _db.Database.BeginTransactionAsync();
        try
        {
            _db.CandidateDocuments.RemoveRange(_db.CandidateDocuments);
            _db.CandidateSkills.RemoveRange(_db.CandidateSkills);
            _db.CandidateJobs.RemoveRange(_db.CandidateJobs);
            _db.Screenings.RemoveRange(_db.Screenings.Where(s => s.CandidateId != 0));
            _db.Interviews.RemoveRange(_db.Interviews.Where(i => i.CandidateId != 0));
            _db.Offers.RemoveRange(_db.Offers.Where(o => o.CandidateId != 0));
            _db.StatusHistories.RemoveRange(_db.StatusHistories.Where(sh => sh.CandidateId != 0));
            _db.Candidates.RemoveRange(_db.Candidates);
            
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
