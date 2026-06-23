namespace RecruitmentSystemAPI.DTOs;

public record CreateCandidateRequest(
    string FullName,
    string Email,
    string? Phone,
    string? Password,
    string? Skills
);
