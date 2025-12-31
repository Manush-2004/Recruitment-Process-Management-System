namespace RecruitmentSystemAPI.Models;

public class Interviewer
{
    public int Id { get; set; }
    public int InterviewId { get; set; }

    public string Name { get; set; } = default!;
    public string Email { get; set; } = default!;

    public Interview? Interview { get; set; }
}
