namespace RecruitmentSystemAPI.Models;

public class BulkUploadResult
{
    public int TotalRows { get; set; }
    public int CreatedCount { get; set; }
    public int LinkedCount { get; set; }
    public List<string> Errors { get; set; } = new();
}
//DTO