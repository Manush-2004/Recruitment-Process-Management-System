namespace RecruitmentSystemAPI.DTOs;

public class UpdateInterviewResultRequest
{
    public string Result { get; set; } = default!; // "Selected" | "Rejected"
}
