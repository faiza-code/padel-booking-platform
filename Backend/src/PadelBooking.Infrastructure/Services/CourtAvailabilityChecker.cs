using Microsoft.EntityFrameworkCore;
using PadelBooking.Domain.Enums;
using PadelBooking.Infrastructure.Persistence;

namespace PadelBooking.Infrastructure.Services;

// منطق مشترك: هل الملعب متاح في تاريخ ووقت معيّن؟
// يفحص: (1) ساعات العمل لليوم  (2) الإغلاقات  (3) تعارض مع حجوزات موجودة
internal static class CourtAvailabilityChecker
{
    public static async Task<List<int>> GetAvailableCourtIdsAsync(
        AppDbContext db, DateOnly date, TimeSpan start, TimeSpan end,
        IEnumerable<(int CourtId, TimeSpan Start, TimeSpan End)>? locallyReserved = null)
    {
        var dayOfWeek = date.DayOfWeek;

        // 1) ملاعب نشطة، ساعات عملها تغطي الفترة المطلوبة بالكامل
        var eligibleCourtIds = await db.Courts
            .Where(c => c.IsActive)
            .Where(c => c.Schedules.Any(s => s.DayOfWeek == dayOfWeek && s.OpenTime <= start && s.CloseTime >= end))
            .Select(c => c.Id)
            .ToListAsync();

        if (eligibleCourtIds.Count == 0) return eligibleCourtIds;

        // 2) استبعاد الملاعب المغلقة (إغلاق عام أو خاص بالملعب) خلال هذا التاريخ
        var closedCourtIds = await db.CourtClosures
            .Where(cl => cl.StartDate <= date && cl.EndDate >= date)
            .Select(cl => cl.CourtId)
            .ToListAsync();

        bool allClosed = closedCourtIds.Contains(null);
        if (allClosed) return new List<int>();

        var specificallyClosed = closedCourtIds.Where(id => id.HasValue).Select(id => id!.Value).ToHashSet();
        eligibleCourtIds = eligibleCourtIds.Where(id => !specificallyClosed.Contains(id)).ToList();
        if (eligibleCourtIds.Count == 0) return eligibleCourtIds;

        // 3) استبعاد الملاعب اللي عليها حجز متعارض بنفس التاريخ (نشط: Pending أو Confirmed)
        var bookedCourtIds = await db.BookingSlots
            .Where(s => s.BookingDate == date
                        && eligibleCourtIds.Contains(s.CourtId)
                        && s.Status != BookingStatus.Cancelled
                        && s.StartTime < end && s.EndTime > start) // تقاطع فترتين زمنيتين
            .Select(s => s.CourtId)
            .Distinct()
            .ToListAsync();

        var available = eligibleCourtIds.Where(id => !bookedCourtIds.Contains(id)).ToList();

        // 4) استبعاد الملاعب المحجوزة محليًا ضمن نفس عملية الحجز (لسه ما انحفظت بقاعدة البيانات)
        if (locallyReserved is not null)
        {
            var locallyBooked = locallyReserved
                .Where(r => r.Start < end && r.End > start)
                .Select(r => r.CourtId)
                .ToHashSet();

            available = available.Where(id => !locallyBooked.Contains(id)).ToList();
        }

        return available;
    }
}
