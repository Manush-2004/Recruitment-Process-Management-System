namespace RecruitmentSystemAPI.Models;

public class Job {
    public int Id { get; set; }
    public string? Title { get; set; }
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsOpen { get; set; } = true;

    public List<RequiredSkill> RequiredSkills { get; set; } = new();
    
    public List<CandidateJob> CandidateJobs { get; set; } = new();

}
