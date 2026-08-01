using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PadelBooking.Application.DTOs;
using PadelBooking.Application.Interfaces;

namespace PadelBooking.Api.Controllers;

// إدارة الملاعب (لوحة التحكم): إضافة / تعديل / حذف / عرض
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CourtsController : ControllerBase
{
    private readonly ICourtService _courtService;

    public CourtsController(ICourtService courtService)
    {
        _courtService = courtService;
    }

    // GET /api/courts?includeInactive=true
    [HttpGet]
    public async Task<ActionResult<List<CourtDto>>> GetAll([FromQuery] bool includeInactive = true)
    {
        var courts = await _courtService.GetAllAsync(includeInactive);
        return Ok(courts);
    }

    // GET /api/courts/5
    [HttpGet("{id:int}")]
    public async Task<ActionResult<CourtDto>> GetById(int id)
    {
        var court = await _courtService.GetByIdAsync(id);
        return court is null ? NotFound() : Ok(court);
    }

    // POST /api/courts
    [HttpPost]
    public async Task<ActionResult<CourtDto>> Create([FromBody] CreateCourtRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            return BadRequest("اسم الملعب مطلوب.");

        if (request.PricePerHour <= 0)
            return BadRequest("سعر الساعة يجب أن يكون أكبر من صفر.");

        var court = await _courtService.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = court.Id }, court);
    }

    // PUT /api/courts/5
    [HttpPut("{id:int}")]
    public async Task<ActionResult<CourtDto>> Update(int id, [FromBody] UpdateCourtRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            return BadRequest("اسم الملعب مطلوب.");

        var court = await _courtService.UpdateAsync(id, request);
        return court is null ? NotFound() : Ok(court);
    }

    // DELETE /api/courts/5
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _courtService.DeleteAsync(id);
        return deleted ? NoContent() : NotFound();
    }
}
