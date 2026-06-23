namespace RecruitmentSystemAPI.DTOs;

public class OfferRequest
{
    public int CandidateId { get; set; }
    public decimal Salary { get; set; }
    public DateTime JoiningDate { get; set; }
}
