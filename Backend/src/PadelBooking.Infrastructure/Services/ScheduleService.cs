using Microsoft.EntityFrameworkCore;
using PadelBooking.Application.DTOs;
using PadelBooking.Application.Interfaces;
using PadelBooking.Domain.Entities;
using PadelBooking.Infrastructure.Persistence;

namespace PadelBooking.Infrastructure.Services;

public class ScheduleService : IScheduleService
{
    private readonly AppDbContext _db;

    public ScheduleService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<ScheduleDto>> GetByCourtIdAsync(int courtId)
    {
        return await _db.CourtSchedules
            .Where(s => s.CourtId == courtId)
            .OrderBy(s => s.DayOfWeek)
            .Select(s => new ScheduleDto { Id = s.Id, DayOfWeek = s.DayOfWeek, OpenTime = s.OpenTime, CloseTime = s.CloseTime })
            .ToListAsync();
    }

    public async Task<List<ScheduleDto>?> SetScheduleAsync(int courtId, SetScheduleRequest request)
    {
        var courtExists = await _db.Courts.AnyAsync(c => c.Id == courtId);
        if (!courtExists) return null;

        foreach (var day in request.Days)
        {
            if (day.OpenTime >= day.CloseTime)
                throw new InvalidOperationException($"وقت الفتح يجب أن يكون قبل وقت الإغلاق ليوم {day.DayOfWeek}.");
        }

        var existing = await _db.CourtSchedules.Where(s => s.CourtId == courtId).ToListAsync();
        _db.CourtSchedules.RemoveRange(existing);

        var newSchedules = request.Days.Select(d => new CourtSchedule
        {
            CourtId = courtId,
            DayOfWeek = d.DayOfWeek,
            OpenTime = d.OpenTime,
            CloseTime = d.CloseTime
        }).ToList();

        _db.CourtSchedules.AddRange(newSchedules);
        await _db.SaveChangesAsync();

        return newSchedules
            .OrderBy(s => s.DayOfWeek)
            .Select(s => new ScheduleDto { Id = s.Id, DayOfWeek = s.DayOfWeek, OpenTime = s.OpenTime, CloseTime = s.CloseTime })
            .ToList();
    }
}
