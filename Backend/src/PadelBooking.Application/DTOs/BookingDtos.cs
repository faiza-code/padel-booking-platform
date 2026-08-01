using PadelBooking.Domain.Enums;

namespace PadelBooking.Application.DTOs;

// فترة زمنية معروضة للعميل - بدون أي إشارة لاسم الملعب
public class AvailableSlotDto
{
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public int AvailableCourtsCount { get; set; }
}

// طلب حجز واحد يشمل فترة أو أكثر (ممكن بتواريخ مختلفة)
public class CreateBookingRequest
{
    public string CustomerPhone { get; set; } = string.Empty; // إجباري
    public string? CustomerName { get; set; }
    public string? CustomerEmail { get; set; }
    public PaymentMethod PaymentMethod { get; set; }
    public List<BookingSlotRequest> Slots { get; set; } = new();
}

public class BookingSlotRequest
{
    public DateOnly Date { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
}

// ما يُرجع للعميل - بدون CourtId أو اسم الملعب إطلاقًا
public class BookingOrderDto
{
    public int Id { get; set; }
    public decimal TotalPrice { get; set; }
    public PaymentMethod PaymentMethod { get; set; }
    public PaymentStatus PaymentStatus { get; set; }
    public List<BookingSlotSummaryDto> Slots { get; set; } = new();
}

public class BookingSlotSummaryDto
{
    public DateOnly Date { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public decimal Price { get; set; }
    public BookingStatus Status { get; set; }
}

// ما يُرجع للوحة التحكم فقط - يشمل كل التفاصيل بما فيها اسم الملعب وبيانات العميل
public class AdminBookingDto
{
    public int Id { get; set; }
    public string CustomerPhone { get; set; } = string.Empty;
    public string? CustomerName { get; set; }
    public string? CustomerEmail { get; set; }
    public PaymentMethod PaymentMethod { get; set; }
    public PaymentStatus PaymentStatus { get; set; }
    public decimal TotalPrice { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<AdminBookingSlotDto> Slots { get; set; } = new();
}

public class AdminBookingSlotDto
{
    public int Id { get; set; }
    public int CourtId { get; set; }
    public string CourtName { get; set; } = string.Empty;
    public DateOnly Date { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public decimal Price { get; set; }
    public BookingStatus Status { get; set; }
}

// فلاتر البحث للوحة التحكم
public class BookingFilterRequest
{
    public int? CourtId { get; set; }
    public DateOnly? FromDate { get; set; }
    public DateOnly? ToDate { get; set; }
    public BookingStatus? Status { get; set; }
    public PaymentMethod? PaymentMethod { get; set; }
}
