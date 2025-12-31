namespace RecruitmentSystemAPI.Models;

public record CreateJobRequest(
    string Title,
    string? Description,
    List<RequiredSkill>? RequiredSkills
);

public record UpdateJobRequest(
    string Title,
    string Description,
    List<RequiredSkill> RequiredSkills,
    bool IsOpen
);

public record CreateCandidateRequest(
    string FullName,
    string Email,
    string? Phone
);