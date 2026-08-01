namespace PadelBooking.Application.DTOs;

public class ScheduleDto
{
    public int Id { get; set; }
    public DayOfWeek DayOfWeek { get; set; }
    public TimeSpan OpenTime { get; set; }
    public TimeSpan CloseTime { get; set; }
}

public class SetScheduleRequest
{
    // يستبدل كامل جدول الأسبوع للملعب دفعة واحدة (أبسط للإدارة من التعديل يوم بيوم)
    public List<DaySchedule> Days { get; set; } = new();
}

public class DaySchedule
{
    public DayOfWeek DayOfWeek { get; set; }
    public TimeSpan OpenTime { get; set; }
    public TimeSpan CloseTime { get; set; }
}

public class ClosureDto
{
    public int Id { get; set; }
    public int? CourtId { get; set; }
    public string? CourtName { get; set; } // للإدارة فقط، ما يظهر للعميل
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public string? Reason { get; set; }
}

public class CreateClosureRequest
{
    // null = إغلاق جميع الملاعب خلال هذه الفترة
    public int? CourtId { get; set; }
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public string? Reason { get; set; }
}
