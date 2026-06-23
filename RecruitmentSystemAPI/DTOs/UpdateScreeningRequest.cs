namespace RecruitmentSystemAPI.DTOs;

public class UpdateScreeningRequest
{
    public string? Status { get; set; }
    public string? Comments { get; set; }
    public List<ScreeningSkillRequest>? Skills { get; set; }
}
