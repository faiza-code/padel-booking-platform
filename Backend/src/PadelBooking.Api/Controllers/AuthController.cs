using Microsoft.AspNetCore.Mvc;
using PadelBooking.Application.DTOs;
using PadelBooking.Application.Interfaces;

namespace PadelBooking.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    // POST /api/auth/login
    [HttpPost("login")]
    public async Task<ActionResult<LoginResponseDto>> Login([FromBody] LoginRequest request)
    {
        var result = await _authService.LoginAsync(request);
        return result is null ? Unauthorized(new { message = "Incorrect username or password." }) : Ok(result);
    }
}
