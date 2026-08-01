using Microsoft.EntityFrameworkCore;
using PadelBooking.Application.DTOs;
using PadelBooking.Application.Interfaces;
using PadelBooking.Domain.Entities;
using PadelBooking.Infrastructure.Persistence;

namespace PadelBooking.Infrastructure.Services;

public class CourtService : ICourtService
{
    private readonly AppDbContext _db;

    public CourtService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<CourtDto>> GetAllAsync(bool includeInactive = true)
    {
        var query = _db.Courts.Include(c => c.PricingTiers).AsQueryable();

        if (!includeInactive)
            query = query.Where(c => c.IsActive);

        var courts = await query.OrderBy(c => c.Id).ToListAsync();
        return courts.Select(ToDto).ToList();
    }

    public async Task<CourtDto?> GetByIdAsync(int id)
    {
        var court = await _db.Courts
            .Include(c => c.PricingTiers)
            .FirstOrDefaultAsync(c => c.Id == id);

        return court is null ? null : ToDto(court);
    }

    public async Task<CourtDto> CreateAsync(CreateCourtRequest request)
    {
        var court = new Court
        {
            Name = request.Name,
            Description = request.Description,
            PricePerHour = request.PricePerHour,
            IsActive = true,
            PricingTiers = request.PricingTiers
                .Select(t => new CourtPricingTier { MinHours = t.MinHours, PricePerHour = t.PricePerHour })
                .ToList()
        };

        _db.Courts.Add(court);
        await _db.SaveChangesAsync();

        return ToDto(court);
    }

    public async Task<CourtDto?> UpdateAsync(int id, UpdateCourtRequest request)
    {
        var court = await _db.Courts
            .Include(c => c.PricingTiers)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (court is null) return null;

        court.Name = request.Name;
        court.Description = request.Description;
        court.PricePerHour = request.PricePerHour;
        court.IsActive = request.IsActive;

        // استبدال شرائح التسعير بالكامل (أبسط وأوضح من عمل diff)
        _db.CourtPricingTiers.RemoveRange(court.PricingTiers);
        court.PricingTiers = request.PricingTiers
            .Select(t => new CourtPricingTier { CourtId = court.Id, MinHours = t.MinHours, PricePerHour = t.PricePerHour })
            .ToList();

        await _db.SaveChangesAsync();
        return ToDto(court);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var court = await _db.Courts.FindAsync(id);
        if (court is null) return false;

        // إذا فيه حجوزات مرتبطة بالملعب، الأفضل تعطيله بدل حذفه فعليًا
        var hasBookings = await _db.BookingSlots.AnyAsync(s => s.CourtId == id);
        if (hasBookings)
        {
            court.IsActive = false;
            await _db.SaveChangesAsync();
            return true;
        }

        _db.Courts.Remove(court);
        await _db.SaveChangesAsync();
        return true;
    }

    private static CourtDto ToDto(Court c) => new()
    {
        Id = c.Id,
        Name = c.Name,
        Description = c.Description,
        PricePerHour = c.PricePerHour,
        IsActive = c.IsActive,
        PricingTiers = c.PricingTiers
            .OrderBy(t => t.MinHours)
            .Select(t => new PricingTierDto { Id = t.Id, MinHours = t.MinHours, PricePerHour = t.PricePerHour })
            .ToList()
    };
}
