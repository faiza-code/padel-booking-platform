using Microsoft.EntityFrameworkCore;
using PadelBooking.Application.DTOs;
using PadelBooking.Application.Interfaces;
using PadelBooking.Domain.Entities;
using PadelBooking.Domain.Enums;
using PadelBooking.Infrastructure.Persistence;

namespace PadelBooking.Infrastructure.Services;

public class BookingService : IBookingService
{
    private readonly AppDbContext _db;
    private static readonly Random _random = new();

    public BookingService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<BookingResult> CreateBookingAsync(CreateBookingRequest request)
    {
        // ---------- Validation أساسي ----------
        if (string.IsNullOrWhiteSpace(request.CustomerPhone))
            return BookingResult.Fail("Phone number required.");

        if (request.Slots.Count == 0)
            return BookingResult.Fail("At least one booking period must be selected.");

        var today = DateOnly.FromDateTime(DateTime.Now);
        var now = DateTime.Now.TimeOfDay;

        foreach (var slot in request.Slots)
        {
            if (slot.StartTime >= slot.EndTime)
                return BookingResult.Fail("The start time must be before the end time.");

            if (slot.Date < today || (slot.Date == today && slot.StartTime < now))
                return BookingResult.Fail($"Past time cannot be booked ({slot.Date:yyyy-MM-dd} {slot.StartTime}).");
        }

        // ---------- توزيع الحجوزات على الملاعب المتاحة ضمن معاملة واحدة ----------
        await using var transaction = await _db.Database.BeginTransactionAsync();
        try
        {
            var reservedThisOrder = new List<(int CourtId, DateOnly Date, TimeSpan Start, TimeSpan End)>();
            var newSlots = new List<BookingSlot>();
            decimal totalPrice = 0;

            foreach (var req in request.Slots)
            {
                var localReservedSameDate = reservedThisOrder
                    .Where(r => r.Date == req.Date)
                    .Select(r => (r.CourtId, r.Start, r.End));

                var availableCourtIds = await CourtAvailabilityChecker.GetAvailableCourtIdsAsync(
                    _db, req.Date, req.StartTime, req.EndTime, localReservedSameDate);

                if (availableCourtIds.Count == 0)
                {
                    await transaction.RollbackAsync();
                    return BookingResult.Fail(
                        $"Sorry, no stadium is available on that date. {req.Date:yyyy-MM-dd} From {req.StartTime} To {req.EndTime}.");
                }

                // التوزيع العشوائي بين الملاعب المتاحة (العميل لا يرى اسم الملعب)
                var chosenCourtId = availableCourtIds[_random.Next(availableCourtIds.Count)];

                var pricePerHour = await GetPriceForDurationAsync(chosenCourtId, req.StartTime, req.EndTime);
                var hours = (decimal)(req.EndTime - req.StartTime).TotalHours;
                var slotPrice = Math.Round(pricePerHour * hours, 3);

                newSlots.Add(new BookingSlot
                {
                    CourtId = chosenCourtId,
                    BookingDate = req.Date,
                    StartTime = req.StartTime,
                    EndTime = req.EndTime,
                    PricePerHour = pricePerHour,
                    Status = request.PaymentMethod == PaymentMethod.Online
                        ? BookingStatus.Pending    // ينتظر تأكيد الدفع الإلكتروني
                        : BookingStatus.Confirmed  // الدفع عند الوصول - الحجز مؤكد فورًا
                });

                reservedThisOrder.Add((chosenCourtId, req.Date, req.StartTime, req.EndTime));
                totalPrice += slotPrice;
            }

            var order = new BookingOrder
            {
                CustomerPhone = request.CustomerPhone,
                CustomerName = request.CustomerName,
                CustomerEmail = request.CustomerEmail,
                PaymentMethod = request.PaymentMethod,
                PaymentStatus = request.PaymentMethod == PaymentMethod.PayOnArrival
                    ? PaymentStatus.Unpaid
                    : PaymentStatus.Unpaid, // يتحدث لاحقًا بعد تأكيد بوابة الدفع الإلكتروني (ثواني)
                TotalPrice = totalPrice,
                Slots = newSlots
            };

            _db.BookingOrders.Add(order);
            await _db.SaveChangesAsync();
            await transaction.CommitAsync();

            return BookingResult.Ok(new BookingOrderDto
            {
                Id = order.Id,
                TotalPrice = order.TotalPrice,
                PaymentMethod = order.PaymentMethod,
                PaymentStatus = order.PaymentStatus,
                Slots = newSlots.Select(s => new BookingSlotSummaryDto
                {
                    Date = s.BookingDate,
                    StartTime = s.StartTime,
                    EndTime = s.EndTime,
                    Price = Math.Round(s.PricePerHour * (decimal)(s.EndTime - s.StartTime).TotalHours, 3),
                    Status = s.Status
                }).ToList()
            });
        }
        catch (Exception)
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    // يحسب سعر الساعة حسب شرائح التسعير المعتمدة على عدد الساعات
    // مثال: 1 ساعة = 10 ريال، 2 ساعة فأكثر = 8 ريال/ساعة
    private async Task<decimal> GetPriceForDurationAsync(int courtId, TimeSpan start, TimeSpan end)
    {
        var hours = (int)Math.Round((end - start).TotalHours);

        var court = await _db.Courts
            .Include(c => c.PricingTiers)
            .FirstAsync(c => c.Id == courtId);

        var applicableTier = court.PricingTiers
            .Where(t => t.MinHours <= hours)
            .OrderByDescending(t => t.MinHours)
            .FirstOrDefault();

        return applicableTier?.PricePerHour ?? court.PricePerHour;
    }

    public async Task<List<BookingOrderDto>> LookupByPhoneAsync(string phone)
    {
        var orders = await _db.BookingOrders
            .Include(o => o.Slots)
            .Where(o => o.CustomerPhone == phone)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();

        return orders.Select(o => new BookingOrderDto
        {
            Id = o.Id,
            TotalPrice = o.TotalPrice,
            PaymentMethod = o.PaymentMethod,
            PaymentStatus = o.PaymentStatus,
            Slots = o.Slots.Select(s => new BookingSlotSummaryDto
            {
                Date = s.BookingDate,
                StartTime = s.StartTime,
                EndTime = s.EndTime,
                Price = Math.Round(s.PricePerHour * (decimal)(s.EndTime - s.StartTime).TotalHours, 3),
                Status = s.Status
            }).ToList()
        }).ToList();
    }
    public async Task<List<AdminBookingDto>> GetAllForAdminAsync(BookingFilterRequest filter)
    {
        var query = _db.BookingOrders
            .Include(o => o.Slots).ThenInclude(s => s.Court)
            .AsQueryable();

        if (filter.CourtId.HasValue)
            query = query.Where(o => o.Slots.Any(s => s.CourtId == filter.CourtId.Value));

        if (filter.FromDate.HasValue)
            query = query.Where(o => o.Slots.Any(s => s.BookingDate >= filter.FromDate.Value));

        if (filter.ToDate.HasValue)
            query = query.Where(o => o.Slots.Any(s => s.BookingDate <= filter.ToDate.Value));

        if (filter.Status.HasValue)
            query = query.Where(o => o.Slots.Any(s => s.Status == filter.Status.Value));

        if (filter.PaymentMethod.HasValue)
            query = query.Where(o => o.PaymentMethod == filter.PaymentMethod.Value);

        var orders = await query.OrderByDescending(o => o.CreatedAt).ToListAsync();

        return orders.Select(o => new AdminBookingDto
        {
            Id = o.Id,
            CustomerPhone = o.CustomerPhone,
            CustomerName = o.CustomerName,
            CustomerEmail = o.CustomerEmail,
            PaymentMethod = o.PaymentMethod,
            PaymentStatus = o.PaymentStatus,
            TotalPrice = o.TotalPrice,
            CreatedAt = o.CreatedAt,
            Slots = o.Slots.Select(s => new AdminBookingSlotDto
            {
                Id = s.Id,
                CourtId = s.CourtId,
                CourtName = s.Court.Name,
                Date = s.BookingDate,
                StartTime = s.StartTime,
                EndTime = s.EndTime,
                Price = Math.Round(s.PricePerHour * (decimal)(s.EndTime - s.StartTime).TotalHours, 3),
                Status = s.Status
            }).ToList()
        }).ToList();
    }
}
