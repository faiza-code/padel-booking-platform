using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using PadelBooking.Application.DTOs;
using PadelBooking.Application.Interfaces;
using PadelBooking.Domain.Enums;
using PadelBooking.Infrastructure.Persistence;

namespace PadelBooking.Infrastructure.Services;

public class ThawaniPaymentService : IThawaniPaymentService
{
    private readonly AppDbContext _db;
    private readonly HttpClient _http;
    private readonly IConfiguration _config;

    public ThawaniPaymentService(AppDbContext db, HttpClient http, IConfiguration config)
    {
        _db = db;
        _http = http;
        _config = config;

        var baseUrl = config["Thawani:BaseUrl"] ?? "https://uatcheckout.thawani.om/api/v1/";
        _http.BaseAddress = new Uri(baseUrl);
        _http.DefaultRequestHeaders.Add("thawani-api-key", config["Thawani:SecretKey"]);
    }

    public async Task<CheckoutSessionDto> CreateCheckoutSessionAsync(int bookingOrderId)
    {
        var order = await _db.BookingOrders.FirstOrDefaultAsync(o => o.Id == bookingOrderId)
            ?? throw new InvalidOperationException("طلب الحجز غير موجود.");

        // ثواني تستخدم البيسة (1 ر.ع = 1000 بيسة) والحد الأدنى للمبلغ
        var unitAmount = (int)Math.Round(order.TotalPrice * 1000);

        var payload = new
        {
            client_reference_id = order.Id.ToString(),
            mode = "payment",
            products = new[]
            {
                new { name = $"حجز رقم {order.Id}", quantity = 1, unit_amount = unitAmount }
            },
            success_url = _config["Thawani:SuccessUrl"] ?? "http://localhost:3000/payment/success",
            cancel_url = _config["Thawani:CancelUrl"] ?? "http://localhost:3000/payment/cancel"
        };

        var response = await _http.PostAsJsonAsync("checkout/session", payload);
        var body = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
            throw new InvalidOperationException($"فشل إنشاء جلسة الدفع عند ثواني: {body}");

        var result = JsonSerializer.Deserialize<ThawaniSessionResponse>(body,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true })!;

        var sessionId = result.Data.SessionId;
        var publishableKey = _config["Thawani:PublishableKey"];
        var checkoutUrl = $"https://uatcheckout.thawani.om/pay/{sessionId}?key={publishableKey}";

        order.ThawaniSessionId = sessionId;
        await _db.SaveChangesAsync();

        return new CheckoutSessionDto { SessionId = sessionId, CheckoutUrl = checkoutUrl };
    }

    public async Task<bool> ConfirmPaymentAsync(int bookingOrderId, string sessionId)
    {
        var order = await _db.BookingOrders
            .Include(o => o.Slots)
            .FirstOrDefaultAsync(o => o.Id == bookingOrderId)
            ?? throw new InvalidOperationException("طلب الحجز غير موجود.");

        var response = await _http.GetAsync($"checkout/session/{sessionId}");
        var body = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
            return false;

        var result = JsonSerializer.Deserialize<ThawaniSessionResponse>(body,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true })!;

        var isPaid = string.Equals(result.Data.PaymentStatus, "paid", StringComparison.OrdinalIgnoreCase);

        order.PaymentStatus = isPaid ? PaymentStatus.Paid : PaymentStatus.Failed;

        if (isPaid)
        {
            foreach (var slot in order.Slots.Where(s => s.Status == BookingStatus.Pending))
                slot.Status = BookingStatus.Confirmed;
        }

        await _db.SaveChangesAsync();

        return isPaid;
    }

    // نماذج بسيطة لتفسير استجابة ثواني (نحتاج فقط الحقول المستخدمة)
    private class ThawaniSessionResponse
    {
        [JsonPropertyName("data")]
        public ThawaniSessionData Data { get; set; } = new();
    }

    private class ThawaniSessionData
    {
        [JsonPropertyName("session_id")]
        public string SessionId { get; set; } = string.Empty;

        [JsonPropertyName("payment_status")]
        public string? PaymentStatus { get; set; }
    }
}
