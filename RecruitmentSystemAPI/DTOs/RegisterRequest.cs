namespace RecruitmentSystemAPI.DTOs;

public record RegisterRequest(string FullName, string Email, string Password, string Role, string? Phone = null, string? Skills = null);
