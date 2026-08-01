using PadelBooking.Domain.Enums;

namespace PadelBooking.Domain.Entities;

// طلب حجز واحد ممكن يحتوي على عدة BookingSlot (أكثر من ساعة وأكثر من يوم بنفس العملية)
public class BookingOrder
{
    public int Id { get; set; }

    public string CustomerPhone { get; set; } = string.Empty; // إجباري
    public string? CustomerName { get; set; }                 // اختياري
    public string? CustomerEmail { get; set; }                // اختياري

    public PaymentMethod PaymentMethod { get; set; }
    public PaymentStatus PaymentStatus { get; set; } = PaymentStatus.Unpaid;

    // معرّف جلسة الدفع الإلكتروني (ثواني) عند الدفع أونلاين
    public string? ThawaniSessionId { get; set; }

    public decimal TotalPrice { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<BookingSlot> Slots { get; set; } = new List<BookingSlot>();
}
