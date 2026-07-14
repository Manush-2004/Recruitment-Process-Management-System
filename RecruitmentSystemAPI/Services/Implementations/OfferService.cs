using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using RecruitmentSystemAPI.DTOs;
using RecruitmentSystemAPI.Exceptions;
using RecruitmentSystemAPI.Models;
using RecruitmentSystemAPI.Repositories.Interfaces;

namespace RecruitmentSystemAPI.Services.Implementations;

public class OfferService
{
    private readonly IOfferRepository _offerRepo;
    private readonly ICandidateRepository _candidateRepo;
    private readonly IWebHostEnvironment _env;
    private readonly StatusService _statusService;

    public OfferService(IOfferRepository offerRepo, ICandidateRepository candidateRepo, IWebHostEnvironment env, StatusService statusService)
    {
        _offerRepo = offerRepo;
        _candidateRepo = candidateRepo;
        _env = env;
        _statusService = statusService;
    }

    public async Task<Offer> CreateOfferAsync(OfferRequest req)
    {
        var candidate = await _candidateRepo.GetByIdAsync(req.CandidateId)
            ?? throw new NotFoundException("Candidate not found");

        var fileName = $"Offer_{candidate.FullName.Replace(" ", "_")}.pdf";
        var path = Path.Combine(_env.WebRootPath!, "offers", fileName);

        Directory.CreateDirectory(Path.GetDirectoryName(path)!);

        // Ensure QuestPDF license is set for non-production/community use
        QuestPDF.Settings.License = LicenseType.Community;

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

        await _offerRepo.AddAsync(offer);

        await _statusService.ChangeCandidateStatusAsync(
            req.CandidateId,
            "Interview Completed",
            "Offer Released",
            "HR"
        );

        return offer;
    }

    public async Task<IEnumerable<Offer>> GetAllAsync()
    {
        return await _offerRepo.GetAllAsync();
    }
}
