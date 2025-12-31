using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using RecruitmentSystemAPI.Data;
using RecruitmentSystemAPI.Models;

public class OfferService
{
    private readonly AppDbContext _db;
    private readonly IWebHostEnvironment _env;
    private readonly StatusService _statusService;

    public OfferService(AppDbContext db, IWebHostEnvironment env, StatusService statusService)
    {
        _db = db;
        _env = env;
        _statusService = statusService;
    }

    public async Task<Offer> CreateOfferAsync(OfferRequest req)
    {
        var candidate = await _db.Candidates.FindAsync(req.CandidateId)
            ?? throw new Exception("Candidate not found");

        var fileName = $"Offer_{candidate.FullName.Replace(" ", "_")}.pdf";
        var path = Path.Combine(_env.WebRootPath!, "offers", fileName);

        Directory.CreateDirectory(Path.GetDirectoryName(path)!);

        Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Content().Padding(20).Column(col =>
                {
                    col.Item().Text("Offer Letter").FontSize(22).Bold();
                    col.Item().Text($"Candidate: {candidate.FullName}");
                    col.Item().Text($"Salary: ₹{req.Salary}");
                    col.Item().Text($"Joining Date: {req.JoiningDate:d}");
                });
            });
        }).GeneratePdf(path);

        var offer = new Offer
        {
            CandidateId = req.CandidateId,
            Salary = req.Salary,
            JoiningDate = req.JoiningDate,
            OfferPdfPath = "/offers/" + fileName
        };

        _db.Offers.Add(offer);
        await _db.SaveChangesAsync();

        await _statusService.ChangeCandidateStatusAsync(
            req.CandidateId,
            "Interview Completed",
            "Offer Released",
            "HR"
        );

        return offer;
    }
}
