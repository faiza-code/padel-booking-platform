using Microsoft.EntityFrameworkCore;
using PadelBooking.Application.DTOs;
using PadelBooking.Application.Interfaces;
using PadelBooking.Infrastructure.Persistence;

namespace PadelBooking.Infrastructure.Services;

public class AvailabilityService : IAvailabilityService
{
    private readonly AppDbContext _db;

    public AvailabilityService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<AvailableSlotDto>> GetAvailableSlotsAsync(DateOnly date)
    {
        var today = DateOnly.FromDateTime(DateTime.Now);
        if (date < today)
            return new List<AvailableSlotDto>(); // يمنع حجز الأوقات الماضية

        var dayOfWeek = date.DayOfWeek;

        // ساعات عمل كل الملاعب النشطة لهذا اليوم من الأسبوع (union) لتحديد النطاق الكلي
        var schedules = await _db.CourtSchedules
            .Where(s => s.DayOfWeek == dayOfWeek && s.Court.IsActive)
            .Select(s => new { s.OpenTime, s.CloseTime })
            .ToListAsync();

        if (schedules.Count == 0) return new List<AvailableSlotDto>();

        var earliestOpen = schedules.Min(s => s.OpenTime);
        var latestClose = schedules.Max(s => s.CloseTime);

        var result = new List<AvailableSlotDto>();
        var now = DateTime.Now.TimeOfDay;

        for (var hour = earliestOpen; hour + TimeSpan.FromHours(1) <= latestClose; hour += TimeSpan.FromHours(1))
        {
            // إذا كان اليوم هو اليوم الحالي، استبعد الأوقات اللي فاتت
            if (date == today && hour < now) continue;

            var availableCourts = await CourtAvailabilityChecker.GetAvailableCourtIdsAsync(
                _db, date, hour, hour + TimeSpan.FromHours(1));

            if (availableCourts.Count > 0)
            {
                result.Add(new AvailableSlotDto
                {
                    StartTime = hour,
                    EndTime = hour + TimeSpan.FromHours(1),
                    AvailableCourtsCount = availableCourts.Count
                });
            }
        }

        return result;
    }
}
