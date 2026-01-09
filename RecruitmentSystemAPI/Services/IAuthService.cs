using RecruitmentSystemAPI.Models;

public interface IAuthService
{
    Task<string> RegisterAsync(RegisterRequest request);
    Task<string> LoginAsync(LoginRequest request);
    Task<RecruitmentSystemAPI.Models.User?> GetUserByEmailAsync(string email);
}
