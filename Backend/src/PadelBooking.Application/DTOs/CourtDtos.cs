namespace PadelBooking.Application.DTOs;

public class CourtDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal PricePerHour { get; set; }
    public bool IsActive { get; set; }
    public List<PricingTierDto> PricingTiers { get; set; } = new();
}

public class PricingTierDto
{
    public int Id { get; set; }
    public int MinHours { get; set; }
    public decimal PricePerHour { get; set; }
}

public class CreateCourtRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal PricePerHour { get; set; }
    public List<CreatePricingTierRequest> PricingTiers { get; set; } = new();
}

public class CreatePricingTierRequest
{
    public int MinHours { get; set; }
    public decimal PricePerHour { get; set; }
}

public class UpdateCourtRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal PricePerHour { get; set; }
    public bool IsActive { get; set; }
    public List<CreatePricingTierRequest> PricingTiers { get; set; } = new();
}
