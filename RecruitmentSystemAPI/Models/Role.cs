namespace RecruitmentSystemAPI.Models;

public class Role
{
    public int Id { get; set; }
    public string Name { get; set; } = default!;
    public List<UserRole> UserRoles { get; set; } = new();
}
