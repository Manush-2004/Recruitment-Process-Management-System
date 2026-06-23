namespace RecruitmentSystemAPI.DTOs;

public class CreateUserRequest
{
    public string FullName { get; set; } = default!;
    public string Email { get; set; } = default!;
    public string Password { get; set; } = default!;
    public string Role { get; set; } = "Recruiter";
    public string? Phone { get; set; }
}
