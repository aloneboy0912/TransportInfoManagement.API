using Microsoft.EntityFrameworkCore;
using TransportInfoManagement.API.Models;

namespace TransportInfoManagement.API.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Service> Services { get; set; }
    public DbSet<Department> Departments { get; set; }
    public DbSet<Employee> Employees { get; set; }
    public DbSet<Client> Clients { get; set; }
    public DbSet<ClientService> ClientServices { get; set; }
    public DbSet<Product> Products { get; set; }
    public DbSet<Payment> Payments { get; set; }
    public DbSet<ServiceFee> ServiceFees { get; set; }
    public DbSet<Contact> Contacts { get; set; }
    public DbSet<CallLog> CallLogs { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Service Fee Configuration
        modelBuilder.Entity<ServiceFee>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.FeePerDayPerEmployee).HasColumnType("decimal(18,2)");
        });

        // Service Configuration
        modelBuilder.Entity<Service>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Name).IsUnique();
        });

        // Department Configuration
        modelBuilder.Entity<Department>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Name).IsUnique();
        });

        // Employee Configuration
        modelBuilder.Entity<Employee>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.Service)
                  .WithMany()
                  .HasForeignKey(e => e.ServiceId)
                  .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(e => e.Department)
                  .WithMany()
                  .HasForeignKey(e => e.DepartmentId)
                  .OnDelete(DeleteBehavior.Restrict);

            // One-to-One relationship with User
            entity.HasOne(e => e.User)
                  .WithOne(u => u.Employee)
                  .HasForeignKey<Employee>(e => e.UserId)
                  .OnDelete(DeleteBehavior.SetNull);
        });

        // Client Configuration
        modelBuilder.Entity<Client>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Email).IsUnique();
        });

        // ClientService Configuration
        modelBuilder.Entity<ClientService>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.Client)
                  .WithMany()
                  .HasForeignKey(e => e.ClientId)
                  .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.Service)
                  .WithMany()
                  .HasForeignKey(e => e.ServiceId)
                  .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(e => e.Employee)
                  .WithMany()
                  .HasForeignKey(e => e.EmployeeId)
                  .OnDelete(DeleteBehavior.SetNull);
        });

        // Product Configuration
        modelBuilder.Entity<Product>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.Client)
                  .WithMany()
                  .HasForeignKey(e => e.ClientId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // Payment Configuration
        modelBuilder.Entity<Payment>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.Client)
                  .WithMany()
                  .HasForeignKey(e => e.ClientId)
                  .OnDelete(DeleteBehavior.Cascade);
            entity.Property(e => e.Amount).HasColumnType("decimal(18,2)");
        });

        // User Configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Username).IsUnique();
            entity.HasIndex(e => e.Email).IsUnique(); // Ensure email is unique
        });

        // Contact Configuration
        modelBuilder.Entity<Contact>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Company).HasMaxLength(200);
            entity.Property(e => e.Phone).HasMaxLength(50);
            entity.Property(e => e.Subject).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Message).IsRequired().HasColumnType("text");
        });

        // CallLog Configuration
        modelBuilder.Entity<CallLog>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.Client)
                  .WithMany()
                  .HasForeignKey(e => e.ClientId)
                  .OnDelete(DeleteBehavior.SetNull);
            entity.HasOne(e => e.Contact)
                  .WithMany()
                  .HasForeignKey(e => e.ContactId)
                  .OnDelete(DeleteBehavior.SetNull);
            entity.HasOne(e => e.Employee)
                  .WithMany()
                  .HasForeignKey(e => e.EmployeeId)
                  .OnDelete(DeleteBehavior.SetNull);
            entity.HasOne(e => e.Service)
                  .WithMany()
                  .HasForeignKey(e => e.ServiceId)
                  .OnDelete(DeleteBehavior.SetNull);
            entity.Property(e => e.CallType).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Outcome).IsRequired().HasMaxLength(50);
            entity.Property(e => e.CustomerName).IsRequired().HasMaxLength(200);
            entity.Property(e => e.CustomerPhone).HasMaxLength(50);
            entity.Property(e => e.CustomerEmail).HasMaxLength(200);
            entity.Property(e => e.Notes).HasColumnType("text");
        });

        // Seed initial data
        SeedData(modelBuilder);
    }

    private void SeedData(ModelBuilder modelBuilder)
    {
        // Seed Services
        modelBuilder.Entity<Service>().HasData(
            new Service { Id = 1, Name = "In-bound Services", Description = "Receiving calls from customers" },
            new Service { Id = 2, Name = "Out-bound Services", Description = "Staff proactively calling customers" },
            new Service { Id = 3, Name = "Tele Marketing Services", Description = "Marketing and sales services via telephone" }
        );

        // Seed Service Fees
        modelBuilder.Entity<ServiceFee>().HasData(
            new ServiceFee { Id = 1, ServiceId = 1, FeePerDayPerEmployee = 4500.00m },
            new ServiceFee { Id = 2, ServiceId = 2, FeePerDayPerEmployee = 6000.00m },
            new ServiceFee { Id = 3, ServiceId = 3, FeePerDayPerEmployee = 5500.00m }
        );

        // Seed Departments - Based on Excell-On Services Requirements
        modelBuilder.Entity<Department>().HasData(
            new Department { Id = 1, Name = "HR Management", Description = "Human Resources Management" },
            new Department { Id = 2, Name = "Administration", Description = "Administration Department" },
            new Department { Id = 3, Name = "Service", Description = "Service Department" },
            new Department { Id = 4, Name = "Training", Description = "Training Department" },
            new Department { Id = 5, Name = "Internet Security", Description = "It will take care of any technical related issues and problems like PC of an employee is hanged, PC of an employee is not getting started, One of the software application is not running properly, installing and uninstalling software, etc." },
            new Department { Id = 6, Name = "Auditors", Description = "Auditing Department" }
        );

        // Seed Users
        // Default admin user (password: admin123)
        modelBuilder.Entity<User>().HasData(
            new User 
            { 
                Id = 1, 
                Username = "admin", 
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
                Email = "admin@excell-on.com",
                FullName = "Administrator",
                Role = "Admin"
            },
            // Employee Accounts - 5 Roles × 6 Departments (30 employees)
            // Password: employee123 for all accounts
            // Username: email address (can login with email)
            // Role mapping: Manager → Admin, Supervisor → Supervisor, Team Lead → Team Lead, Agent → Agent
            // PROTECTED: User IDs 2-31 and Employee IDs 1-30 are protected system accounts
            // These accounts cannot be edited or deleted through the UI/API
            
            // HR Management Department (User IDs: 2-6)
            new User { Id = 2, Username = "hr.admin@excell-on.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("employee123"), Email = "hr.admin@excell-on.com", FullName = "HR Admin", Role = "Admin" },
            new User { Id = 3, Username = "hr.manager@excell-on.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("employee123"), Email = "hr.manager@excell-on.com", FullName = "HR Manager", Role = "Admin" },
            new User { Id = 4, Username = "hr.supervisor@excell-on.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("employee123"), Email = "hr.supervisor@excell-on.com", FullName = "HR Supervisor", Role = "Supervisor" },
            new User { Id = 5, Username = "hr.teamlead@excell-on.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("employee123"), Email = "hr.teamlead@excell-on.com", FullName = "HR Team Lead", Role = "Team Lead" },
            new User { Id = 6, Username = "hr.agent@excell-on.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("employee123"), Email = "hr.agent@excell-on.com", FullName = "HR Agent", Role = "Agent" },
            
            // Administration Department (User IDs: 7-11)
            new User { Id = 7, Username = "admin.dept.admin@excell-on.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("employee123"), Email = "admin.dept.admin@excell-on.com", FullName = "Admin Dept Admin", Role = "Admin" },
            new User { Id = 8, Username = "admin.dept.manager@excell-on.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("employee123"), Email = "admin.dept.manager@excell-on.com", FullName = "Admin Dept Manager", Role = "Admin" },
            new User { Id = 9, Username = "admin.dept.supervisor@excell-on.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("employee123"), Email = "admin.dept.supervisor@excell-on.com", FullName = "Admin Dept Supervisor", Role = "Supervisor" },
            new User { Id = 10, Username = "admin.dept.teamlead@excell-on.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("employee123"), Email = "admin.dept.teamlead@excell-on.com", FullName = "Admin Dept Team Lead", Role = "Team Lead" },
            new User { Id = 11, Username = "admin.dept.agent@excell-on.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("employee123"), Email = "admin.dept.agent@excell-on.com", FullName = "Admin Dept Agent", Role = "Agent" },
            
            // Service Department (User IDs: 12-16)
            new User { Id = 12, Username = "service.admin@excell-on.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("employee123"), Email = "service.admin@excell-on.com", FullName = "Service Admin", Role = "Admin" },
            new User { Id = 13, Username = "service.manager@excell-on.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("employee123"), Email = "service.manager@excell-on.com", FullName = "Service Manager", Role = "Admin" },
            new User { Id = 14, Username = "service.supervisor@excell-on.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("employee123"), Email = "service.supervisor@excell-on.com", FullName = "Service Supervisor", Role = "Supervisor" },
            new User { Id = 15, Username = "service.teamlead@excell-on.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("employee123"), Email = "service.teamlead@excell-on.com", FullName = "Service Team Lead", Role = "Team Lead" },
            new User { Id = 16, Username = "service.agent@excell-on.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("employee123"), Email = "service.agent@excell-on.com", FullName = "Service Agent", Role = "Agent" },
            
            // Training Department (User IDs: 17-21)
            new User { Id = 17, Username = "training.admin@excell-on.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("employee123"), Email = "training.admin@excell-on.com", FullName = "Training Admin", Role = "Admin" },
            new User { Id = 18, Username = "training.manager@excell-on.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("employee123"), Email = "training.manager@excell-on.com", FullName = "Training Manager", Role = "Admin" },
            new User { Id = 19, Username = "training.supervisor@excell-on.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("employee123"), Email = "training.supervisor@excell-on.com", FullName = "Training Supervisor", Role = "Supervisor" },
            new User { Id = 20, Username = "training.teamlead@excell-on.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("employee123"), Email = "training.teamlead@excell-on.com", FullName = "Training Team Lead", Role = "Team Lead" },
            new User { Id = 21, Username = "training.agent@excell-on.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("employee123"), Email = "training.agent@excell-on.com", FullName = "Training Agent", Role = "Agent" },
            
            // Internet Security Department (User IDs: 22-26)
            new User { Id = 22, Username = "security.admin@excell-on.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("employee123"), Email = "security.admin@excell-on.com", FullName = "Security Admin", Role = "Admin" },
            new User { Id = 23, Username = "security.manager@excell-on.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("employee123"), Email = "security.manager@excell-on.com", FullName = "Security Manager", Role = "Admin" },
            new User { Id = 24, Username = "security.supervisor@excell-on.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("employee123"), Email = "security.supervisor@excell-on.com", FullName = "Security Supervisor", Role = "Supervisor" },
            new User { Id = 25, Username = "security.teamlead@excell-on.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("employee123"), Email = "security.teamlead@excell-on.com", FullName = "Security Team Lead", Role = "Team Lead" },
            new User { Id = 26, Username = "security.agent@excell-on.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("employee123"), Email = "security.agent@excell-on.com", FullName = "Security Agent", Role = "Agent" },
            
            // Auditors Department (User IDs: 27-31)
            new User { Id = 27, Username = "auditor.admin@excell-on.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("employee123"), Email = "auditor.admin@excell-on.com", FullName = "Auditor Admin", Role = "Admin" },
            new User { Id = 28, Username = "auditor.manager@excell-on.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("employee123"), Email = "auditor.manager@excell-on.com", FullName = "Auditor Manager", Role = "Admin" },
            new User { Id = 29, Username = "auditor.supervisor@excell-on.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("employee123"), Email = "auditor.supervisor@excell-on.com", FullName = "Auditor Supervisor", Role = "Supervisor" },
            new User { Id = 30, Username = "auditor.teamlead@excell-on.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("employee123"), Email = "auditor.teamlead@excell-on.com", FullName = "Auditor Team Lead", Role = "Team Lead" },
            new User { Id = 31, Username = "auditor.agent@excell-on.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("employee123"), Email = "auditor.agent@excell-on.com", FullName = "Auditor Agent", Role = "Agent" }
        );

        // Seed Employees
        // 5 Roles × 6 Departments = 30 employees (Employee IDs: 1-30)
        // PROTECTED: These employee accounts (IDs 1-30) are protected system accounts
        // They cannot be edited or deleted through the UI/API - see EmployeesController for protection logic
        var baseDate = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        modelBuilder.Entity<Employee>().HasData(
            // HR Management Department (Employee IDs: 1-5, User IDs: 2-6)
            new Employee { Id = 1, EmployeeCode = "EMP001", FullName = "HR Admin", Email = "hr.admin@excell-on.com", Phone = "+1-555-2001", Position = "HR Administrator", Role = "Admin", ServiceId = 1, DepartmentId = 1, UserId = 2, HireDate = baseDate.AddDays(-365), IsActive = true, CreatedAt = baseDate.AddDays(-365) },
            new Employee { Id = 2, EmployeeCode = "EMP002", FullName = "HR Manager", Email = "hr.manager@excell-on.com", Phone = "+1-555-2002", Position = "HR Manager", Role = "Manager", ServiceId = 1, DepartmentId = 1, UserId = 3, HireDate = baseDate.AddDays(-300), IsActive = true, CreatedAt = baseDate.AddDays(-300) },
            new Employee { Id = 3, EmployeeCode = "EMP003", FullName = "HR Supervisor", Email = "hr.supervisor@excell-on.com", Phone = "+1-555-2003", Position = "HR Supervisor", Role = "Supervisor", ServiceId = 1, DepartmentId = 1, UserId = 4, HireDate = baseDate.AddDays(-240), IsActive = true, CreatedAt = baseDate.AddDays(-240) },
            new Employee { Id = 4, EmployeeCode = "EMP004", FullName = "HR Team Lead", Email = "hr.teamlead@excell-on.com", Phone = "+1-555-2004", Position = "HR Team Lead", Role = "Team Lead", ServiceId = 1, DepartmentId = 1, UserId = 5, HireDate = baseDate.AddDays(-180), IsActive = true, CreatedAt = baseDate.AddDays(-180) },
            new Employee { Id = 5, EmployeeCode = "EMP005", FullName = "HR Agent", Email = "hr.agent@excell-on.com", Phone = "+1-555-2005", Position = "HR Agent", Role = "Agent", ServiceId = 1, DepartmentId = 1, UserId = 6, HireDate = baseDate.AddDays(-120), IsActive = true, CreatedAt = baseDate.AddDays(-120) },
            
            // Administration Department (Employee IDs: 6-10, User IDs: 7-11)
            new Employee { Id = 6, EmployeeCode = "EMP006", FullName = "Admin Dept Admin", Email = "admin.dept.admin@excell-on.com", Phone = "+1-555-2006", Position = "Administration Admin", Role = "Admin", ServiceId = 1, DepartmentId = 2, UserId = 7, HireDate = baseDate.AddDays(-365), IsActive = true, CreatedAt = baseDate.AddDays(-365) },
            new Employee { Id = 7, EmployeeCode = "EMP007", FullName = "Admin Dept Manager", Email = "admin.dept.manager@excell-on.com", Phone = "+1-555-2007", Position = "Administration Manager", Role = "Manager", ServiceId = 1, DepartmentId = 2, UserId = 8, HireDate = baseDate.AddDays(-300), IsActive = true, CreatedAt = baseDate.AddDays(-300) },
            new Employee { Id = 8, EmployeeCode = "EMP008", FullName = "Admin Dept Supervisor", Email = "admin.dept.supervisor@excell-on.com", Phone = "+1-555-2008", Position = "Administration Supervisor", Role = "Supervisor", ServiceId = 1, DepartmentId = 2, UserId = 9, HireDate = baseDate.AddDays(-240), IsActive = true, CreatedAt = baseDate.AddDays(-240) },
            new Employee { Id = 9, EmployeeCode = "EMP009", FullName = "Admin Dept Team Lead", Email = "admin.dept.teamlead@excell-on.com", Phone = "+1-555-2009", Position = "Administration Team Lead", Role = "Team Lead", ServiceId = 1, DepartmentId = 2, UserId = 10, HireDate = baseDate.AddDays(-180), IsActive = true, CreatedAt = baseDate.AddDays(-180) },
            new Employee { Id = 10, EmployeeCode = "EMP010", FullName = "Admin Dept Agent", Email = "admin.dept.agent@excell-on.com", Phone = "+1-555-2010", Position = "Administration Agent", Role = "Agent", ServiceId = 1, DepartmentId = 2, UserId = 11, HireDate = baseDate.AddDays(-120), IsActive = true, CreatedAt = baseDate.AddDays(-120) },
            
            // Service Department (Employee IDs: 11-15, User IDs: 12-16)
            new Employee { Id = 11, EmployeeCode = "EMP011", FullName = "Service Admin", Email = "service.admin@excell-on.com", Phone = "+1-555-2011", Position = "Service Administrator", Role = "Admin", ServiceId = 1, DepartmentId = 3, UserId = 12, HireDate = baseDate.AddDays(-365), IsActive = true, CreatedAt = baseDate.AddDays(-365) },
            new Employee { Id = 12, EmployeeCode = "EMP012", FullName = "Service Manager", Email = "service.manager@excell-on.com", Phone = "+1-555-2012", Position = "Service Manager", Role = "Manager", ServiceId = 2, DepartmentId = 3, UserId = 13, HireDate = baseDate.AddDays(-300), IsActive = true, CreatedAt = baseDate.AddDays(-300) },
            new Employee { Id = 13, EmployeeCode = "EMP013", FullName = "Service Supervisor", Email = "service.supervisor@excell-on.com", Phone = "+1-555-2013", Position = "Service Supervisor", Role = "Supervisor", ServiceId = 2, DepartmentId = 3, UserId = 14, HireDate = baseDate.AddDays(-240), IsActive = true, CreatedAt = baseDate.AddDays(-240) },
            new Employee { Id = 14, EmployeeCode = "EMP014", FullName = "Service Team Lead", Email = "service.teamlead@excell-on.com", Phone = "+1-555-2014", Position = "Service Team Lead", Role = "Team Lead", ServiceId = 2, DepartmentId = 3, UserId = 15, HireDate = baseDate.AddDays(-180), IsActive = true, CreatedAt = baseDate.AddDays(-180) },
            new Employee { Id = 15, EmployeeCode = "EMP015", FullName = "Service Agent", Email = "service.agent@excell-on.com", Phone = "+1-555-2015", Position = "Service Agent", Role = "Agent", ServiceId = 3, DepartmentId = 3, UserId = 16, HireDate = baseDate.AddDays(-120), IsActive = true, CreatedAt = baseDate.AddDays(-120) },
            
            // Training Department (Employee IDs: 16-20, User IDs: 17-21)
            new Employee { Id = 16, EmployeeCode = "EMP016", FullName = "Training Admin", Email = "training.admin@excell-on.com", Phone = "+1-555-2016", Position = "Training Administrator", Role = "Admin", ServiceId = 1, DepartmentId = 4, UserId = 17, HireDate = baseDate.AddDays(-365), IsActive = true, CreatedAt = baseDate.AddDays(-365) },
            new Employee { Id = 17, EmployeeCode = "EMP017", FullName = "Training Manager", Email = "training.manager@excell-on.com", Phone = "+1-555-2017", Position = "Training Manager", Role = "Manager", ServiceId = 2, DepartmentId = 4, UserId = 18, HireDate = baseDate.AddDays(-300), IsActive = true, CreatedAt = baseDate.AddDays(-300) },
            new Employee { Id = 18, EmployeeCode = "EMP018", FullName = "Training Supervisor", Email = "training.supervisor@excell-on.com", Phone = "+1-555-2018", Position = "Training Supervisor", Role = "Supervisor", ServiceId = 2, DepartmentId = 4, UserId = 19, HireDate = baseDate.AddDays(-240), IsActive = true, CreatedAt = baseDate.AddDays(-240) },
            new Employee { Id = 19, EmployeeCode = "EMP019", FullName = "Training Team Lead", Email = "training.teamlead@excell-on.com", Phone = "+1-555-2019", Position = "Training Team Lead", Role = "Team Lead", ServiceId = 2, DepartmentId = 4, UserId = 20, HireDate = baseDate.AddDays(-180), IsActive = true, CreatedAt = baseDate.AddDays(-180) },
            new Employee { Id = 20, EmployeeCode = "EMP020", FullName = "Training Agent", Email = "training.agent@excell-on.com", Phone = "+1-555-2020", Position = "Training Agent", Role = "Agent", ServiceId = 3, DepartmentId = 4, UserId = 21, HireDate = baseDate.AddDays(-120), IsActive = true, CreatedAt = baseDate.AddDays(-120) },
            
            // Internet Security Department (Employee IDs: 21-25, User IDs: 22-26)
            new Employee { Id = 21, EmployeeCode = "EMP021", FullName = "Security Admin", Email = "security.admin@excell-on.com", Phone = "+1-555-2021", Position = "IT Security Administrator", Role = "Admin", ServiceId = 1, DepartmentId = 5, UserId = 22, HireDate = baseDate.AddDays(-365), IsActive = true, CreatedAt = baseDate.AddDays(-365) },
            new Employee { Id = 22, EmployeeCode = "EMP022", FullName = "Security Manager", Email = "security.manager@excell-on.com", Phone = "+1-555-2022", Position = "IT Security Manager", Role = "Manager", ServiceId = 1, DepartmentId = 5, UserId = 23, HireDate = baseDate.AddDays(-300), IsActive = true, CreatedAt = baseDate.AddDays(-300) },
            new Employee { Id = 23, EmployeeCode = "EMP023", FullName = "Security Supervisor", Email = "security.supervisor@excell-on.com", Phone = "+1-555-2023", Position = "IT Security Supervisor", Role = "Supervisor", ServiceId = 1, DepartmentId = 5, UserId = 24, HireDate = baseDate.AddDays(-240), IsActive = true, CreatedAt = baseDate.AddDays(-240) },
            new Employee { Id = 24, EmployeeCode = "EMP024", FullName = "Security Team Lead", Email = "security.teamlead@excell-on.com", Phone = "+1-555-2024", Position = "IT Security Team Lead", Role = "Team Lead", ServiceId = 1, DepartmentId = 5, UserId = 25, HireDate = baseDate.AddDays(-180), IsActive = true, CreatedAt = baseDate.AddDays(-180) },
            new Employee { Id = 25, EmployeeCode = "EMP025", FullName = "Security Agent", Email = "security.agent@excell-on.com", Phone = "+1-555-2025", Position = "IT Security Agent", Role = "Agent", ServiceId = 1, DepartmentId = 5, UserId = 26, HireDate = baseDate.AddDays(-120), IsActive = true, CreatedAt = baseDate.AddDays(-120) },
            
            // Auditors Department (Employee IDs: 26-30, User IDs: 27-31)
            new Employee { Id = 26, EmployeeCode = "EMP026", FullName = "Auditor Admin", Email = "auditor.admin@excell-on.com", Phone = "+1-555-2026", Position = "Audit Administrator", Role = "Admin", ServiceId = 3, DepartmentId = 6, UserId = 27, HireDate = baseDate.AddDays(-365), IsActive = true, CreatedAt = baseDate.AddDays(-365) },
            new Employee { Id = 27, EmployeeCode = "EMP027", FullName = "Auditor Manager", Email = "auditor.manager@excell-on.com", Phone = "+1-555-2027", Position = "Audit Manager", Role = "Manager", ServiceId = 3, DepartmentId = 6, UserId = 28, HireDate = baseDate.AddDays(-300), IsActive = true, CreatedAt = baseDate.AddDays(-300) },
            new Employee { Id = 28, EmployeeCode = "EMP028", FullName = "Auditor Supervisor", Email = "auditor.supervisor@excell-on.com", Phone = "+1-555-2028", Position = "Audit Supervisor", Role = "Supervisor", ServiceId = 3, DepartmentId = 6, UserId = 29, HireDate = baseDate.AddDays(-240), IsActive = true, CreatedAt = baseDate.AddDays(-240) },
            new Employee { Id = 29, EmployeeCode = "EMP029", FullName = "Auditor Team Lead", Email = "auditor.teamlead@excell-on.com", Phone = "+1-555-2029", Position = "Audit Team Lead", Role = "Team Lead", ServiceId = 3, DepartmentId = 6, UserId = 30, HireDate = baseDate.AddDays(-180), IsActive = true, CreatedAt = baseDate.AddDays(-180) },
            new Employee { Id = 30, EmployeeCode = "EMP030", FullName = "Auditor Agent", Email = "auditor.agent@excell-on.com", Phone = "+1-555-2030", Position = "Audit Agent", Role = "Agent", ServiceId = 3, DepartmentId = 6, UserId = 31, HireDate = baseDate.AddDays(-120), IsActive = true, CreatedAt = baseDate.AddDays(-120) }
        );

    }
}

