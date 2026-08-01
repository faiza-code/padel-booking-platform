using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PadelBooking.Application.DTOs;
using PadelBooking.Application.Interfaces;

namespace PadelBooking.Api.Controllers;

// إدارة إغلاق الملاعب (ملعب واحد / عدة ملاعب / جميع الملاعب) بأيام أو تواريخ محددة
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ClosuresController : ControllerBase
{
    private readonly IClosureService _closureService;

    public ClosuresController(IClosureService closureService)
    {
        _closureService = closureService;
    }

    // GET /api/closures
    [HttpGet]
    public async Task<ActionResult<List<ClosureDto>>> GetAll()
    {
        return Ok(await _closureService.GetAllAsync());
    }

    // POST /api/closures   (CourtId = null => إغلاق جميع الملاعب)
    [HttpPost]
    public async Task<ActionResult<ClosureDto>> Create([FromBody] CreateClosureRequest request)
    {
        try
        {
            var closure = await _closureService.CreateAsync(request);
            return Ok(closure);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    // DELETE /api/closures/5   (لإعادة فتح الملعب)
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _closureService.DeleteAsync(id);
        return deleted ? NoContent() : NotFound();
    }
}
