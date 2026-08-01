using Microsoft.EntityFrameworkCore;
using PadelBooking.Domain.Entities;

namespace PadelBooking.Infrastructure.Persistence;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Court> Courts => Set<Court>();
    public DbSet<CourtPricingTier> CourtPricingTiers => Set<CourtPricingTier>();
    public DbSet<CourtSchedule> CourtSchedules => Set<CourtSchedule>();
    public DbSet<CourtClosure> CourtClosures => Set<CourtClosure>();
    public DbSet<BookingOrder> BookingOrders => Set<BookingOrder>();
    public DbSet<BookingSlot> BookingSlots => Set<BookingSlot>();
    public DbSet<AdminUser> AdminUsers => Set<AdminUser>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Court>(e =>
        {
            e.Property(x => x.Name).HasMaxLength(150).IsRequired();
            e.Property(x => x.PricePerHour).HasColumnType("decimal(10,3)");
        });

        modelBuilder.Entity<CourtPricingTier>(e =>
        {
            e.Property(x => x.PricePerHour).HasColumnType("decimal(10,3)");
            e.HasOne(x => x.Court)
                .WithMany(c => c.PricingTiers)
                .HasForeignKey(x => x.CourtId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<CourtSchedule>(e =>
        {
            e.HasOne(x => x.Court)
                .WithMany(c => c.Schedules)
                .HasForeignKey(x => x.CourtId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<CourtClosure>(e =>
        {
            // Restrict حتى لا يحصل multiple cascade paths مع BookingSlot
            e.HasOne(x => x.Court)
                .WithMany(c => c.Closures)
                .HasForeignKey(x => x.CourtId)
                .OnDelete(DeleteBehavior.Cascade)
                .IsRequired(false);
        });

        modelBuilder.Entity<BookingOrder>(e =>
        {
            e.Property(x => x.CustomerPhone).HasMaxLength(20).IsRequired();
            e.Property(x => x.CustomerName).HasMaxLength(150);
            e.Property(x => x.CustomerEmail).HasMaxLength(150);
            e.Property(x => x.TotalPrice).HasColumnType("decimal(10,3)");
        });

        modelBuilder.Entity<BookingSlot>(e =>
        {
            e.Property(x => x.PricePerHour).HasColumnType("decimal(10,3)");

            e.HasOne(x => x.BookingOrder)
                .WithMany(o => o.Slots)
                .HasForeignKey(x => x.BookingOrderId)
                .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(x => x.Court)
                .WithMany(c => c.BookingSlots)
                .HasForeignKey(x => x.CourtId)
                .OnDelete(DeleteBehavior.Restrict); // منع cascade مزدوج

            // فهرس مهم لتسريع فحص التوفر (ملعب + تاريخ)
            e.HasIndex(x => new { x.CourtId, x.BookingDate });
        });

        modelBuilder.Entity<AdminUser>(e =>
        {
            e.Property(x => x.Username).HasMaxLength(100).IsRequired();
            e.Property(x => x.PasswordHash).IsRequired();
            e.HasIndex(x => x.Username).IsUnique();
        });
    }
}
