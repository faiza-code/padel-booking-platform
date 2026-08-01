using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using PadelBooking.Domain.Entities;
using PadelBooking.Infrastructure.Persistence;

namespace PadelBooking.Infrastructure.Services;

public static class AdminUserSeeder
{
    public static async Task SeedAsync(AppDbContext db, IConfiguration config)
    {
        if (await db.AdminUsers.AnyAsync()) return;

        var username = config["Admin:DefaultUsername"] ?? "admin";
        var password = config["Admin:DefaultPassword"] ?? "Admin@12345";

        db.AdminUsers.Add(new AdminUser
        {
            Username = username,
            PasswordHash = PasswordHasher.Hash(password)
        });

        await db.SaveChangesAsync();
    }
}
