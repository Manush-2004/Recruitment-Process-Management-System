namespace RecruitmentSystemAPI.Models;

public class Candidate
{
    public int Id { get; set; }
    public string FullName { get; set; } = default!;
    public string Email { get; set; } = default!;
    public string? Phone { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Candidate may have multiple documents (CV, other docs), multiple skills, and be linked to multiple jobs
    public List<CandidateDocument> Documents { get; set; } = new();
    public List<CandidateSkill> Skills { get; set; } = new();
    public List<CandidateJob> CandidateJobs { get; set; } = new();
}