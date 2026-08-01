namespace PadelBooking.Domain.Entities;

// مثال: MinHours = 1 -> PricePerHour = 10, MinHours = 2 -> PricePerHour = 8
// عند الحساب: نختار أعلى MinHours أقل من أو يساوي عدد الساعات المطلوبة
public class CourtPricingTier
{
    public int Id { get; set; }
    public int CourtId { get; set; }
    public Court Court { get; set; } = null!;

    public int MinHours { get; set; }
    public decimal PricePerHour { get; set; }
}
