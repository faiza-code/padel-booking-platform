using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PadelBooking.Application.DTOs;
using PadelBooking.Application.Interfaces;

namespace PadelBooking.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BookingsController : ControllerBase
{
    private readonly IBookingService _bookingService;
    private readonly IThawaniPaymentService _paymentService;

    public BookingsController(IBookingService bookingService, IThawaniPaymentService paymentService)
    {
        _bookingService = bookingService;
        _paymentService = paymentService;
    }

    // POST /api/bookings  (واجهة العميل - بدون تسجيل دخول)
    [HttpPost]
    [AllowAnonymous]
    public async Task<ActionResult<BookingOrderDto>> Create([FromBody] CreateBookingRequest request)
    {
        var result = await _bookingService.CreateBookingAsync(request);

        if (!result.Success)
            return BadRequest(new { message = result.ErrorMessage });

        return Ok(result.Order);
    }

    // GET /api/bookings  (لوحة التحكم فقط - مع فلترة حسب الملعب/التاريخ/الحالة/طريقة الدفع)
    [HttpGet]
    [Authorize]
    public async Task<ActionResult<List<AdminBookingDto>>> GetAll([FromQuery] BookingFilterRequest filter)
    {
        var bookings = await _bookingService.GetAllForAdminAsync(filter);
        return Ok(bookings);
    }

    // POST /api/bookings/5/checkout  (العميل يبدأ الدفع الإلكتروني عبر ثواني)
    [HttpPost("{id:int}/checkout")]
    [AllowAnonymous]
    public async Task<ActionResult<CheckoutSessionDto>> Checkout(int id)
    {
        try
        {
            var session = await _paymentService.CreateCheckoutSessionAsync(id);
            return Ok(session);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // POST /api/bookings/5/confirm-payment  (يُستدعى بعد رجوع العميل من صفحة الدفع)
    [HttpPost("{id:int}/confirm-payment")]
    [AllowAnonymous]
    public async Task<IActionResult> ConfirmPayment(int id, [FromBody] ConfirmPaymentRequest request)
    {
        var success = await _paymentService.ConfirmPaymentAsync(id, request.SessionId);
        return success ? Ok(new { paid = true }) : BadRequest(new { paid = false, message = "لم يتم تأكيد الدفع بعد." });
    }
}
