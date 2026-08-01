using PadelBooking.Domain.Enums;

namespace PadelBooking.Domain.Entities;

// فترة حجز واحدة (ساعة أو أكثر متتالية) في تاريخ معيّن على ملعب تم تخصيصه عشوائيًا
// مهم: CourtId ما يُرجع للعميل عبر الـ API إطلاقًا (يُستخدم داخليًا فقط)
public class BookingSlot
{
    public int Id { get; set; }

    public int BookingOrderId { get; set; }
    public BookingOrder BookingOrder { get; set; } = null!;

    public int CourtId { get; set; }
    public Court Court { get; set; } = null!;

    public DateOnly BookingDate { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }

    public decimal PricePerHour { get; set; } // السعر الفعلي المطبق وقت الحجز (snapshot)

    public BookingStatus Status { get; set; } = BookingStatus.Pending;
}
