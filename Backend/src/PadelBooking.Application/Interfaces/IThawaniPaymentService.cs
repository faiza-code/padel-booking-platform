using PadelBooking.Application.DTOs;

namespace PadelBooking.Application.Interfaces;

public interface IThawaniPaymentService
{
    // ينشئ جلسة دفع في ثواني (Sandbox) لطلب حجز معيّن، ويرجع رابط الدفع
    Task<CheckoutSessionDto> CreateCheckoutSessionAsync(int bookingOrderId);

    // يتحقق من حالة الدفع عند ثواني، ويحدّث حالة الطلب إذا نجح الدفع فعليًا
    Task<bool> ConfirmPaymentAsync(int bookingOrderId, string sessionId);
}
