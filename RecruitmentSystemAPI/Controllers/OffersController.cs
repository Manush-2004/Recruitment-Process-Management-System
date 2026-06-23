using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RecruitmentSystemAPI.Models;
using RecruitmentSystemAPI.DTOs;
using RecruitmentSystemAPI.Services.Implementations;

[Authorize(Roles = "HR")]
[ApiController]
[Route("api/offers")]
public class OffersController : ControllerBase
{
    private readonly OfferService _service;

    public OffersController(OfferService service)
    {
        _service = service;
    }

    [HttpGet]
    [Authorize(Roles = "Recruiter,HR")]
    public async Task<ActionResult<IEnumerable<Offer>>> GetAll()
    {
        var list = await _service.GetAllAsync();
        return Ok(list);
    }

    [HttpPost]
    public async Task<IActionResult> Create(OfferRequest req)
    {
        var offer = await _service.CreateOfferAsync(req);
        return Ok(offer);
    }
}
