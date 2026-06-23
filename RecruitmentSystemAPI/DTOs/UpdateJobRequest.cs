using RecruitmentSystemAPI.Models;

namespace RecruitmentSystemAPI.DTOs;

public record UpdateJobRequest(
    string Title,
    string Description,
    List<RequiredSkill> RequiredSkills,
    bool IsOpen
);
