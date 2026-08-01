using PadelBooking.Application.DTOs;

namespace PadelBooking.Application.Interfaces;

public interface ICourtService
{
    Task<List<CourtDto>> GetAllAsync(bool includeInactive = true);
    Task<CourtDto?> GetByIdAsync(int id);
    Task<CourtDto> CreateAsync(CreateCourtRequest request);
    Task<CourtDto?> UpdateAsync(int id, UpdateCourtRequest request);
    Task<bool> DeleteAsync(int id);
}
