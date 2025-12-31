using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RecruitmentSystemAPI.Models;

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

    [HttpPost]
    public async Task<IActionResult> Create(OfferRequest req)
    {
        var offer = await _service.CreateOfferAsync(req);
        return Ok(offer);
    }
}
