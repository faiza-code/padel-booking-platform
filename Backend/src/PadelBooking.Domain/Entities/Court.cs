namespace PadelBooking.Domain.Entities;

public class Court
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }

    // السعر الافتراضي للساعة الواحدة (يُستخدم إذا ما فيه شرائح تسعير تنطبق)
    public decimal PricePerHour { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<CourtPricingTier> PricingTiers { get; set; } = new List<CourtPricingTier>();
    public ICollection<CourtSchedule> Schedules { get; set; } = new List<CourtSchedule>();
    public ICollection<CourtClosure> Closures { get; set; } = new List<CourtClosure>();
    public ICollection<BookingSlot> BookingSlots { get; set; } = new List<BookingSlot>();
}
