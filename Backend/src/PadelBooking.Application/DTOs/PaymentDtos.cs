namespace PadelBooking.Application.DTOs;

public class CheckoutSessionDto
{
    public string SessionId { get; set; } = string.Empty;
    public string CheckoutUrl { get; set; } = string.Empty;
}

public class ConfirmPaymentRequest
{
    public string SessionId { get; set; } = string.Empty;
}
