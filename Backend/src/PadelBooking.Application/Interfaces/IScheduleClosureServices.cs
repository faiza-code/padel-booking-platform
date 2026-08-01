using PadelBooking.Application.DTOs;

namespace PadelBooking.Application.Interfaces;

public interface IScheduleService
{
    Task<List<ScheduleDto>> GetByCourtIdAsync(int courtId);
    Task<List<ScheduleDto>?> SetScheduleAsync(int courtId, SetScheduleRequest request);
}

public interface IClosureService
{
    Task<List<ClosureDto>> GetAllAsync();
    Task<ClosureDto> CreateAsync(CreateClosureRequest request);
    Task<bool> DeleteAsync(int id);
}
