using Microsoft.AspNetCore.Mvc;
using PadelBooking.Application.DTOs;
using PadelBooking.Application.Interfaces;

namespace PadelBooking.Api.Controllers;

// واجهة العميل: عرض الأوقات المتاحة بتاريخ معيّن (بدون كشف أسماء الملاعب)
[ApiController]
[Route("api/[controller]")]
public class AvailabilityController : ControllerBase
{
    private readonly IAvailabilityService _availabilityService;

    public AvailabilityController(IAvailabilityService availabilityService)
    {
        _availabilityService = availabilityService;
    }

    // GET /api/availability?date=2026-08-05
    [HttpGet]
    public async Task<ActionResult<List<AvailableSlotDto>>> Get([FromQuery] DateOnly date)
    {
        var slots = await _availabilityService.GetAvailableSlotsAsync(date);
        return Ok(slots);
    }
}
