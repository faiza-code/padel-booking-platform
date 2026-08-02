using Microsoft.EntityFrameworkCore;
using PadelBooking.Application.DTOs;
using PadelBooking.Application.Interfaces;
using PadelBooking.Domain.Entities;
using PadelBooking.Infrastructure.Persistence;

namespace PadelBooking.Infrastructure.Services;

public class ClosureService : IClosureService
{
    private readonly AppDbContext _db;

    public ClosureService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<ClosureDto>> GetAllAsync()
    {
        return await _db.CourtClosures
            .Include(c => c.Court)
            .OrderByDescending(c => c.StartDate)
            .Select(c => new ClosureDto
            {
                Id = c.Id,
                CourtId = c.CourtId,
                CourtName = c.Court != null ? c.Court.Name : "All stadiums",
                StartDate = c.StartDate,
                EndDate = c.EndDate,
                Reason = c.Reason
            })
            .ToListAsync();
    }

    public async Task<ClosureDto> CreateAsync(CreateClosureRequest request)
    {
        if (request.StartDate > request.EndDate)
            throw new InvalidOperationException("The start date must be before or equal to the end date.");

        var closure = new CourtClosure
        {
            CourtId = request.CourtId,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            Reason = request.Reason
        };

        _db.CourtClosures.Add(closure);
        await _db.SaveChangesAsync();

        string courtName = "All stadiums";
        if (request.CourtId.HasValue)
        {
            var court = await _db.Courts.FindAsync(request.CourtId.Value);
            courtName = court?.Name ?? "unknown";
        }

        return new ClosureDto
        {
            Id = closure.Id,
            CourtId = closure.CourtId,
            CourtName = courtName,
            StartDate = closure.StartDate,
            EndDate = closure.EndDate,
            Reason = closure.Reason
        };
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var closure = await _db.CourtClosures.FindAsync(id);
        if (closure is null) return false;

        _db.CourtClosures.Remove(closure);
        await _db.SaveChangesAsync();
        return true;
    }
}
