namespace RecruitmentSystemAPI.Models;

public class Offer
{
    public int Id { get; set; }
    public int CandidateId { get; set; }

    public decimal Salary { get; set; }
    public DateTime JoiningDate { get; set; }
    public string OfferPdfPath { get; set; } = default!;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public Candidate? Candidate { get; set; }
}
