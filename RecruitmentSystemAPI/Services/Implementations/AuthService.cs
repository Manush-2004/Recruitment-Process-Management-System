using BCrypt.Net;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using RecruitmentSystemAPI.Data;
using RecruitmentSystemAPI.DTOs;
using RecruitmentSystemAPI.Models;
using RecruitmentSystemAPI.Services.Interfaces;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace RecruitmentSystemAPI.Services.Implementations;

public class AuthService : IAuthService
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _config;

    public AuthService(AppDbContext db, IConfiguration config)
    {
        _db = db;
        _config = config;
    }

    public async Task<string> RegisterAsync(RegisterRequest req)
    {
        if (await _db.Users.AnyAsync(u => u.Email == req.Email))
            throw new Exception("User already exists");

        var role = await _db.Roles.FirstOrDefaultAsync(r => r.Name == req.Role)
                   ?? new Role { Name = req.Role };

        var user = new User
        {
            FullName = req.FullName,
            Email = req.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password)
        };

        user.UserRoles.Add(new UserRole { Role = role });

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        // If this is a Candidate registration, ensure Candidate profile is created and add phone/skills
        if (string.Equals(req.Role, "Candidate", StringComparison.OrdinalIgnoreCase))
        {
            var existing = await _db.Candidates.FirstOrDefaultAsync(c => c.Email == req.Email);
            if (existing == null)
            {
                var cand = new Candidate { FullName = req.FullName, Email = req.Email, Phone = req.Phone };
                _db.Candidates.Add(cand);
                await _db.SaveChangesAsync();

                if (!string.IsNullOrWhiteSpace(req.Skills))
                {
                    var parts = req.Skills.Split(new[] { ',', ';' }, StringSplitOptions.RemoveEmptyEntries);
                    foreach (var p in parts)
                    {
                        var seg = p.Split(':', StringSplitOptions.RemoveEmptyEntries);
                        var name = seg[0].Trim();
                        var years = 0;
                        if (seg.Length > 1 && int.TryParse(seg[1].Trim(), out var y)) years = y;
                        if (string.IsNullOrWhiteSpace(name)) continue;
                        _db.CandidateSkills.Add(new CandidateSkill { CandidateId = cand.Id, Name = name, Years = years });
                    }
                    await _db.SaveChangesAsync();
                }
            }
            else if (!string.IsNullOrWhiteSpace(req.Phone) && string.IsNullOrWhiteSpace(existing.Phone))
            {
                existing.Phone = req.Phone;
                await _db.SaveChangesAsync();
            }
        }

        return GenerateToken(user);
    }

    public async Task<string> LoginAsync(LoginRequest req)
    {
        var user = await _db.Users
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Email == req.Email);

        if (user == null || !BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash))
            throw new Exception("Invalid credentials");

        return GenerateToken(user);
    }

    public async Task<User?> GetUserByEmailAsync(string email)
    {
        return await _db.Users.Include(u => u.UserRoles).ThenInclude(ur => ur.Role).FirstOrDefaultAsync(u => u.Email == email);
    }

    private string GenerateToken(User user)
    {
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.Name, user.Email),
            new Claim("FullName", user.FullName)
        };

        foreach (var role in user.UserRoles)
            claims.Add(new Claim(ClaimTypes.Role, role.Role!.Name));

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(int.Parse(_config["Jwt:ExpiresMinutes"]!)),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
