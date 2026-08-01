using PadelBooking.Application.DTOs;

namespace PadelBooking.Application.Interfaces;

public interface IAuthService
{
    Task<LoginResponseDto?> LoginAsync(LoginRequest request);
}
