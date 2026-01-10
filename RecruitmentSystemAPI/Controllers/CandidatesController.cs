using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using RecruitmentSystemAPI.Models;
using RecruitmentSystemAPI.Services;

namespace RecruitmentSystemAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CandidatesController : ControllerBase
{
    private readonly ICandidateService _service;

    private readonly ILogger<CandidatesController> _logger;

    public CandidatesController(ICandidateService service, ILogger<CandidatesController> logger)
    {
        _service = service;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Candidate>>> GetAll()
    {
        var list = await _service.GetAllAsync();
        return Ok(list);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<Candidate>> Get(int id)
    {
        var cand = await _service.GetAsync(id);
        if (cand == null) return NotFound();
        return Ok(cand);
    }

    // Returns the authenticated candidate's profile
    [HttpGet("me")]
    [Authorize(Roles = "Candidate")]
    public async Task<ActionResult<Candidate>> Me()
    {
        var email = User.FindFirst(ClaimTypes.Name)?.Value;
        if (string.IsNullOrWhiteSpace(email)) return Unauthorized();
        var cand = await _service.GetByEmailAsync(email);
        if (cand == null) return NotFound();
        return Ok(cand);
    }

    // Candidate's interviews
    [HttpGet("me/interviews")]
    [Authorize(Roles = "Candidate")]
    public async Task<ActionResult<IEnumerable<Interview>>> MyInterviews()
    {
        var email = User.FindFirst(ClaimTypes.Name)?.Value;
        if (string.IsNullOrWhiteSpace(email)) return Unauthorized();
        var cand = await _service.GetByEmailAsync(email);
        if (cand == null) return NotFound();
        var interviews = await _service.GetInterviewsForCandidateAsync(cand.Id);
        return Ok(interviews);
    }

    // Candidate's offers
    [HttpGet("me/offers")]
    [Authorize(Roles = "Candidate")]
    public async Task<ActionResult<IEnumerable<Offer>>> MyOffers()
    {
        var email = User.FindFirst(ClaimTypes.Name)?.Value;
        if (string.IsNullOrWhiteSpace(email)) return Unauthorized();
        var cand = await _service.GetByEmailAsync(email);
        if (cand == null) return NotFound();
        var offers = await _service.GetOffersForCandidateAsync(cand.Id);
        return Ok(offers);
    }

    // Candidate's status history
    [HttpGet("me/status-history")]
    [Authorize(Roles = "Candidate")]
    public async Task<ActionResult<IEnumerable<StatusHistory>>> MyStatusHistory()
    {
        var email = User.FindFirst(ClaimTypes.Name)?.Value;
        if (string.IsNullOrWhiteSpace(email)) return Unauthorized();
        var cand = await _service.GetByEmailAsync(email);
        if (cand == null) return NotFound();
        var history = await _service.GetStatusHistoryForCandidateAsync(cand.Id);
        return Ok(history);
    }

    // Upload document for authenticated candidate
    [HttpPost("me/documents")]
    [Authorize(Roles = "Candidate")]
    [RequestSizeLimit(20_000_000)]
    public async Task<IActionResult> UploadDocument([FromForm] IFormFile file)
    {
        if (file == null) return BadRequest("File is required");
        var email = User.FindFirst(ClaimTypes.Name)?.Value;
        if (string.IsNullOrWhiteSpace(email)) return Unauthorized();
        var cand = await _service.GetByEmailAsync(email);
        if (cand == null) return NotFound();
        try
        {
            var doc = await _service.UploadDocumentAsync(cand.Id, file);
            return CreatedAtAction(nameof(Get), new { id = cand.Id }, doc);
        }
        catch (ArgumentException aex)
        {
            _logger.LogWarning(aex, "Validation error uploading document");
            return BadRequest(aex.Message);
        }
    }

    // Accept multipart/form-data: fields + file ("cv")
    [HttpPost]
    [RequestSizeLimit(20_000_000)] // 20MB limit (adjust as needed)
    public async Task<IActionResult> Create([FromForm] string fullName, [FromForm] string email, [FromForm] string? phone, [FromForm] IFormFile? cv)
    {
        _logger.LogDebug("Create Candidate called with fullName={FullName}, email={Email}, hasFile={HasFile}", fullName, email, cv != null);

        if (string.IsNullOrWhiteSpace(fullName) || string.IsNullOrWhiteSpace(email))
            return BadRequest("FullName and Email are required.");
        var dto = new CreateCandidateRequest(fullName, email, phone);
        try
        {
            var candidate = await _service.CreateCandidateAsync(dto, cv);
            _logger.LogInformation("Candidate created with id={CandidateId}", candidate.Id);
            return CreatedAtAction(nameof(Get), new { id = candidate.Id }, candidate);
        }
        catch (ArgumentException aex)
        {
            _logger.LogWarning(aex, "Validation error creating candidate");
            return BadRequest(aex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error creating candidate for email={Email}: {Ex}", email, ex.ToString());
            // return a generic problem response to the client
            return Problem(detail: "An unexpected error occurred while creating the candidate.", statusCode: 500);
        }
    }

    [HttpPost("bulk")]
    [RequestSizeLimit(50_000_000)]
    public async Task<IActionResult> Bulk([FromForm] IFormFile file)
    {
        if (file == null) return BadRequest("File is required");
        var result = await _service.BulkUploadFromExcelAsync(file);
        return Ok(result);
    }

    /// <summary>
    /// Get candidates currently at a specific stage (e.g., "HR").
    /// </summary>
    [HttpGet("hr-stage")]
    [Authorize(Roles = "HR")]
    public async Task<ActionResult<IEnumerable<Candidate>>> GetCandidatesAtStage([FromQuery] string stage)
    {
        if (string.IsNullOrWhiteSpace(stage)) return BadRequest("stage query parameter is required");
        var list = await _service.GetCandidatesAtStageAsync(stage);
        return Ok(list);
    }

    /// <summary>
    /// Get documents for a candidate (HR role).
    /// </summary>
    [HttpGet("{id:int}/documents")]
    [Authorize(Roles = "HR")]
    public async Task<ActionResult<IEnumerable<CandidateDocument>>> GetCandidateDocuments(int id)
    {
        var cand = await _service.GetAsync(id);
        if (cand == null) return NotFound();
        var docs = await _service.GetCandidateDocumentsAsync(id);
        return Ok(docs);
    }

    /// <summary>
    /// Verify (or un-verify) a candidate document.
    /// </summary>
    public class VerifyDocumentRequest { public bool Verified { get; set; } }

    [HttpPost("{candidateId:int}/documents/{documentId:int}/verify")]
    [Authorize(Roles = "HR")]
    public async Task<IActionResult> VerifyDocument(int candidateId, int documentId, [FromQuery] bool? verified = null, [FromBody] VerifyDocumentRequest? body = null)
    {
        var cand = await _service.GetAsync(candidateId);
        if (cand == null) return NotFound();
        var isVerified = verified ?? body?.Verified ?? true;
        try
        {
            var doc = await _service.VerifyDocumentAsync(candidateId, documentId, isVerified);
            return Ok(doc);
        }
        catch (ArgumentException aex)
        {
            _logger.LogWarning(aex, "Document verification failed");
            return NotFound(aex.Message);
        }
    }

}    