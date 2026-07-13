using BCrypt.Net;
using Microsoft.IdentityModel.Tokens;
using RecruitmentSystemAPI.DTOs;
using RecruitmentSystemAPI.Models;
using RecruitmentSystemAPI.Repositories.Interfaces;
using RecruitmentSystemAPI.Services.Interfaces;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace RecruitmentSystemAPI.Services.Implementations;

public class AuthService : IAuthService
{
    private readonly IAuthRepository _authRepo;
    private readonly ICandidateRepository _candidateRepo;
    private readonly IConfiguration _config;

    public AuthService(IAuthRepository authRepo, ICandidateRepository candidateRepo, IConfiguration config)
    {
        _authRepo = authRepo;
        _candidateRepo = candidateRepo;
        _config = config;
    }

    public async Task<string> RegisterAsync(RegisterRequest req)
    {
        if (await _authRepo.UserExistsAsync(req.Email))
            throw new Exception("User already exists");

        var role = await _authRepo.GetOrCreateRoleAsync(req.Role);

        var user = new User
        {
            FullName = req.FullName,
            Email = req.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password)
        };

        user.UserRoles.Add(new UserRole { Role = role });

        await _authRepo.AddUserAsync(user);

        // If this is a Candidate registration, ensure Candidate profile is created and add phone/skills
        if (string.Equals(req.Role, "Candidate", StringComparison.OrdinalIgnoreCase))
        {
            var existing = await _candidateRepo.GetByEmailAsync(req.Email);
            if (existing == null)
            {
                var cand = new Candidate { FullName = req.FullName, Email = req.Email, Phone = req.Phone };
                await _candidateRepo.AddAsync(cand);

                if (!string.IsNullOrWhiteSpace(req.Skills))
                {
                    var parts = req.Skills.Split(new[] { ',', ';' }, StringSplitOptions.RemoveEmptyEntries);
                    var newSkills = new List<CandidateSkill>();
                    foreach (var p in parts)
                    {
                        var seg = p.Split(':', StringSplitOptions.RemoveEmptyEntries);
                        var name = seg[0].Trim();
                        var years = 0;
                        if (seg.Length > 1 && int.TryParse(seg[1].Trim(), out var y)) years = y;
                        if (string.IsNullOrWhiteSpace(name)) continue;
                        newSkills.Add(new CandidateSkill { CandidateId = cand.Id, Name = name, Years = years });
                    }
                    if (newSkills.Any())
                    {
                        await _candidateRepo.AddSkillsAsync(newSkills);
                    }
                }
            }
            else if (!string.IsNullOrWhiteSpace(req.Phone) && string.IsNullOrWhiteSpace(existing.Phone))
            {
                await _candidateRepo.UpdatePhoneAsync(existing, req.Phone);
            }
        }

        return GenerateToken(user);
    }

    public async Task<string> LoginAsync(LoginRequest req)
    {
        var user = await _authRepo.GetUserByEmailWithRolesAsync(req.Email);

        if (user == null || !BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash))
            throw new Exception("Invalid credentials");

        return GenerateToken(user);
    }

    public async Task<User?> GetUserByEmailAsync(string email)
    {
        return await _authRepo.GetUserByEmailWithRolesAsync(email);
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
