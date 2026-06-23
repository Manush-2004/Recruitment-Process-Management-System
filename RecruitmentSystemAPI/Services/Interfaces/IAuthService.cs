using RecruitmentSystemAPI.DTOs;
using RecruitmentSystemAPI.Models;

namespace RecruitmentSystemAPI.Services.Interfaces;

public interface IAuthService
{
    Task<string> RegisterAsync(RegisterRequest request);
    Task<string> LoginAsync(LoginRequest request);
    Task<User?> GetUserByEmailAsync(string email);
}
