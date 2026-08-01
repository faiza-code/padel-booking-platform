using PadelBooking.Application.DTOs;

namespace PadelBooking.Application.Interfaces;

public interface IAvailabilityService
{
    // يرجع الأوقات المتاحة خلال اليوم بخطوات ساعة واحدة (بدون كشف أسماء الملاعب)
    Task<List<AvailableSlotDto>> GetAvailableSlotsAsync(DateOnly date);
}

public interface IBookingService
{
    Task<BookingResult> CreateBookingAsync(CreateBookingRequest request);
    Task<List<AdminBookingDto>> GetAllForAdminAsync(BookingFilterRequest filter);
}

// نتيجة محاولة الحجز - تفرّق بين النجاح والفشل مع سبب واضح للعميل
public class BookingResult
{
    public bool Success { get; init; }
    public string? ErrorMessage { get; init; }
    public BookingOrderDto? Order { get; init; }

    public static BookingResult Ok(BookingOrderDto order) => new() { Success = true, Order = order };
    public static BookingResult Fail(string message) => new() { Success = false, ErrorMessage = message };
}
