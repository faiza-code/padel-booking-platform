using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PadelBooking.Application.DTOs;
using PadelBooking.Application.Interfaces;

namespace PadelBooking.Api.Controllers;

// إدارة ساعات عمل كل ملعب
[ApiController]
[Route("api/courts/{courtId:int}/schedule")]
[Authorize]
public class SchedulesController : ControllerBase
{
    private readonly IScheduleService _scheduleService;

    public SchedulesController(IScheduleService scheduleService)
    {
        _scheduleService = scheduleService;
    }

    // GET /api/courts/5/schedule
    [HttpGet]
    public async Task<ActionResult<List<ScheduleDto>>> Get(int courtId)
    {
        var schedule = await _scheduleService.GetByCourtIdAsync(courtId);
        return Ok(schedule);
    }

    // PUT /api/courts/5/schedule  (يستبدل جدول الأسبوع بالكامل)
    [HttpPut]
    public async Task<ActionResult<List<ScheduleDto>>> Set(int courtId, [FromBody] SetScheduleRequest request)
    {
        try
        {
            var result = await _scheduleService.SetScheduleAsync(courtId, request);
            return result is null ? NotFound("الملعب غير موجود.") : Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }
}
