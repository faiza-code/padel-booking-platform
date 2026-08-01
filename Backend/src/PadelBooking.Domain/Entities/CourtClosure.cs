namespace PadelBooking.Domain.Entities;

// CourtId = null  => إغلاق جميع الملاعب خلال هذه الفترة
// CourtId = قيمة  => إغلاق ملعب محدد فقط
// StartDate == EndDate => إغلاق يوم واحد فقط
public class CourtClosure
{
    public int Id { get; set; }
    public int? CourtId { get; set; }
    public Court? Court { get; set; }

    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public string? Reason { get; set; }
}
