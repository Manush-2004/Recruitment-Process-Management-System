namespace RecruitmentSystemAPI.Models;

public class CandidateSkill
{
    public int Id { get; set; }
    public int CandidateId { get; set; }
    public string Name { get; set; } = default!;
    public int Years { get; set; } = 0;
    public Candidate? Candidate { get; set; }
}
