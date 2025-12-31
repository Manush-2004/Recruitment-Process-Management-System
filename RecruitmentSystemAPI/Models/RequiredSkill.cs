namespace RecruitmentSystemAPI.Models;

public class RequiredSkill
{
    public int Id { get; set; }
    public int JobId { get; set; }
    public string Name { get; set; } = default!;
    public int MinYears { get; set; }
    public Job? Job { get; set; }
}