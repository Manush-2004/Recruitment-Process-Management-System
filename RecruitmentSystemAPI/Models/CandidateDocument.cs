namespace RecruitmentSystemAPI.Models;

public class CandidateDocument
{ 
    public int Id { get; set; }
    public int CandidateId { get; set; }
    public string FileName { get; set; } = default!;       // original filename
    public string FilePath { get; set; } = default!;       // relative path (wwwroot/uploads/...)
    public string ContentType { get; set; } = default!;
    public long Size { get; set; }
    [System.Text.Json.Serialization.JsonIgnore]
    public Candidate? Candidate { get; set; }
    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
}