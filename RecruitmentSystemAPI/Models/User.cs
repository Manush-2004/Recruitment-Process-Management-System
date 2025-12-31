namespace RecruitmentSystemAPI.Models;

public class User
{
    public int Id { get; set; }
    public string FullName { get; set; } = default!;
    public string Email { get; set; } = default!;
    public string PasswordHash { get; set; } = default!;
    public List<UserRole> UserRoles { get; set; } = new();
}
