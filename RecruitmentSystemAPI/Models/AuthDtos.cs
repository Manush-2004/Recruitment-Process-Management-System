namespace RecruitmentSystemAPI.Models;

public record RegisterRequest(string FullName, string Email, string Password, string Role, string? Phone = null, string? Skills = null);
public record LoginRequest(string Email, string Password);
