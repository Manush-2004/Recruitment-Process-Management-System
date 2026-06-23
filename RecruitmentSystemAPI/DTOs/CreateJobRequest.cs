using RecruitmentSystemAPI.Models;

namespace RecruitmentSystemAPI.DTOs;

public record CreateJobRequest(
    string Title,
    string? Description,
    List<RequiredSkill>? RequiredSkills
);
