namespace RecruitmentSystemAPI.Models;

public class CandidateJob
{
    public int Id { get; set; }
    public int CandidateId { get; set; }
    public int JobId { get; set; }
    public DateTime LinkedAt { get; set; } = DateTime.UtcNow;

    public Candidate? Candidate { get; set; }
    public Job? Job { get; set; }
}
