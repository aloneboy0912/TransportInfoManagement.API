using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using TransportInfoManagement.API.Data;
using TransportInfoManagement.API.Models;
using TransportInfoManagement.API.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Configure JSON serialization to use camelCase
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.WriteIndented = false;
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Configure Entity Framework with MySQL
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? "Server=localhost;Database=TransportInfoDB;User=root;Password=;Port=3306;";
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

// Configure JWT Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"] ?? "YourSuperSecretKeyForJWTTokenGeneration12345";
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"] ?? "TransportInfoManagement",
        ValidAudience = jwtSettings["Audience"] ?? "TransportInfoManagement",
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey))
    };
});

// Register services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IEmailService, EmailService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// CORS must be before authentication
app.UseCors("AllowAll");

// Configure authentication/authorization
app.UseAuthentication();
app.UseAuthorization();

// Enable default files (index.html) - must be before UseStaticFiles
app.UseDefaultFiles();

// Serve static files from wwwroot
app.UseStaticFiles();

// Map API controllers
app.MapControllers();

var env = app.Services.GetRequiredService<IWebHostEnvironment>();

// Login page route
app.MapGet("/login", async (context) =>
{
    var loginFilePath = Path.Combine(env.WebRootPath, "login.html");
    if (File.Exists(loginFilePath))
    {
        context.Response.ContentType = "text/html";
        await context.Response.SendFileAsync(loginFilePath);
        return;
    }
    // Fallback to admin panel if login.html doesn't exist
    var adminFilePath = Path.Combine(env.WebRootPath, "index.html");
    if (File.Exists(adminFilePath))
    {
        context.Response.ContentType = "text/html";
        await context.Response.SendFileAsync(adminFilePath);
    }
});

// Admin panel route - serve admin panel at /admin
app.MapGet("/admin", async (context) =>
{
    var adminFilePath = Path.Combine(env.WebRootPath, "index.html");
    if (File.Exists(adminFilePath))
    {
        context.Response.ContentType = "text/html";
        await context.Response.SendFileAsync(adminFilePath);
    }
});

// Root route - redirect to login page
app.MapGet("/", (context) =>
{
    context.Response.Redirect("/login");
    return Task.CompletedTask;
});

// Fallback for admin panel SPA routing (routes starting with /admin)
app.MapFallback(context =>
{
    var path = context.Request.Path.Value?.ToLower();
    // Only handle /admin routes for SPA fallback
    if (path?.StartsWith("/admin") == true && !path.StartsWith("/api"))
    {
        var adminFilePath = Path.Combine(env.WebRootPath, "index.html");
        if (File.Exists(adminFilePath))
        {
            context.Response.ContentType = "text/html";
            return context.Response.SendFileAsync(adminFilePath);
        }
    }
    return Task.CompletedTask;
});

// Ensure database is created and update existing data
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    // Note: Using manual table creation instead of EnsureCreated() to avoid conflicts with existing tables
    
    // Ensure Contacts table exists (for existing databases that were created before Contact model was added)
    try
    {
        db.Database.ExecuteSqlRaw(@"
            CREATE TABLE IF NOT EXISTS `Contacts` (
                `Id` int NOT NULL AUTO_INCREMENT,
                `Name` varchar(200) NOT NULL,
                `Email` varchar(200) NOT NULL,
                `Company` varchar(200) NULL,
                `Phone` varchar(50) NULL,
                `Subject` varchar(200) NOT NULL,
                `Message` text NOT NULL,
                `CreatedAt` datetime(6) NOT NULL,
                `IsProcessed` tinyint(1) NOT NULL DEFAULT 0,
                PRIMARY KEY (`Id`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    }
    catch (Exception ex)
    {
        // Log error but don't fail startup - table might already exist
        Console.WriteLine($"Warning: Could not create Contacts table: {ex.Message}");
    }
    
    // Ensure CallLogs table exists
    try
    {
        db.Database.ExecuteSqlRaw(@"
            CREATE TABLE IF NOT EXISTS `CallLogs` (
                `Id` int NOT NULL AUTO_INCREMENT,
                `ClientId` int NULL,
                `ContactId` int NULL,
                `EmployeeId` int NULL,
                `ServiceId` int NULL,
                `CallDate` datetime(6) NOT NULL,
                `CallDuration` int NOT NULL,
                `CallType` varchar(50) NOT NULL,
                `Outcome` varchar(50) NOT NULL,
                `CustomerName` varchar(200) NOT NULL,
                `CustomerPhone` varchar(50) NULL,
                `CustomerEmail` varchar(200) NULL,
                `Notes` text NULL,
                `IsResolved` tinyint(1) NOT NULL DEFAULT 0,
                `CreatedAt` datetime(6) NOT NULL,
                PRIMARY KEY (`Id`),
                INDEX `IX_CallLogs_ClientId` (`ClientId`),
                INDEX `IX_CallLogs_ContactId` (`ContactId`),
                INDEX `IX_CallLogs_EmployeeId` (`EmployeeId`),
                INDEX `IX_CallLogs_ServiceId` (`ServiceId`),
                CONSTRAINT `FK_CallLogs_Clients_ClientId` FOREIGN KEY (`ClientId`) REFERENCES `Clients` (`Id`) ON DELETE SET NULL,
                CONSTRAINT `FK_CallLogs_Contacts_ContactId` FOREIGN KEY (`ContactId`) REFERENCES `Contacts` (`Id`) ON DELETE SET NULL,
                CONSTRAINT `FK_CallLogs_Employees_EmployeeId` FOREIGN KEY (`EmployeeId`) REFERENCES `Employees` (`Id`) ON DELETE SET NULL,
                CONSTRAINT `FK_CallLogs_Services_ServiceId` FOREIGN KEY (`ServiceId`) REFERENCES `Services` (`Id`) ON DELETE SET NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    }
    catch (Exception ex)
    {
        // Log error but don't fail startup - table might already exist
        Console.WriteLine($"Warning: Could not create CallLogs table: {ex.Message}");
    }
    
    // Note: Department seeding is handled by ApplicationDbContext.HasData() during migrations
    // This ensures departments are only seeded once via Entity Framework migrations

    // Ensure mock service data exists - Match frontend naming exactly
    if (!db.Services.Any())
    {
        var servicesList = new List<Service>
        {
            new Service { Id = 1, Name = "In-bound Services", Description = "Receiving calls from customers", IsActive = true, CreatedAt = DateTime.UtcNow },
            new Service { Id = 2, Name = "Out-bound Services", Description = "Staff proactively calling customers", IsActive = true, CreatedAt = DateTime.UtcNow },
            new Service { Id = 3, Name = "Tele Marketing Services", Description = "Marketing and sales services via telephone", IsActive = true, CreatedAt = DateTime.UtcNow }
        };
        db.Services.AddRange(servicesList);
        db.SaveChanges();
    }
    
    // Update existing services to match frontend naming if they exist with old names
    var existingServices = db.Services.ToList();
    foreach (var service in existingServices)
    {
        switch (service.Id)
        {
            case 1:
                if (service.Name != "In-bound Services")
                {
                    service.Name = "In-bound Services";
                    service.Description = "Receiving calls from customers";
                }
                break;
            case 2:
                if (service.Name != "Out-bound Services")
                {
                    service.Name = "Out-bound Services";
                    service.Description = "Staff proactively calling customers";
                }
                break;
            case 3:
                if (service.Name != "Tele Marketing Services")
                {
                    service.Name = "Tele Marketing Services";
                    service.Description = "Marketing and sales services via telephone";
                }
                break;
        }
    }
    db.SaveChanges();

    // Ensure Service Fees match frontend pricing exactly
    if (!db.ServiceFees.Any())
    {
        var serviceFees = new List<ServiceFee>
        {
            new ServiceFee { Id = 1, ServiceId = 1, FeePerDayPerEmployee = 4500.00m },
            new ServiceFee { Id = 2, ServiceId = 2, FeePerDayPerEmployee = 6000.00m },
            new ServiceFee { Id = 3, ServiceId = 3, FeePerDayPerEmployee = 5500.00m }
        };
        db.ServiceFees.AddRange(serviceFees);
        db.SaveChanges();
    }
    else
    {
        // Update existing service fees to match frontend pricing
        var serviceFees = db.ServiceFees.ToList();
        foreach (var fee in serviceFees)
        {
            switch (fee.ServiceId)
            {
                case 1:
                    if (fee.FeePerDayPerEmployee != 4500.00m)
                        fee.FeePerDayPerEmployee = 4500.00m;
                    break;
                case 2:
                    if (fee.FeePerDayPerEmployee != 6000.00m)
                        fee.FeePerDayPerEmployee = 6000.00m;
                    break;
                case 3:
                    if (fee.FeePerDayPerEmployee != 5500.00m)
                        fee.FeePerDayPerEmployee = 5500.00m;
                    break;
            }
        }
        db.SaveChanges();
    }

    // Remove duplicate employees (keep the oldest record by ID)
    // This prevents duplicates from multiple seeding sources (ApplicationDbContext, Program.cs, SQL scripts)
    try
    {
        var allEmployees = db.Employees.ToList();
        var employeesToDelete = new List<Employee>();

        // Find duplicates by Email (case-insensitive)
        var emailGroups = allEmployees
            .Where(e => !string.IsNullOrEmpty(e.Email))
            .GroupBy(e => e.Email.ToLower())
            .Where(g => g.Count() > 1)
            .ToList();
        
        foreach (var group in emailGroups)
        {
            var sorted = group.OrderBy(e => e.Id).ToList();
            // Keep the first (oldest), mark the rest for deletion
            employeesToDelete.AddRange(sorted.Skip(1));
        }

        // Find duplicates by EmployeeCode (case-insensitive)
        var codeGroups = allEmployees
            .Where(e => !string.IsNullOrEmpty(e.EmployeeCode))
            .GroupBy(e => e.EmployeeCode.ToLower())
            .Where(g => g.Count() > 1)
            .ToList();
        
        foreach (var group in codeGroups)
        {
            var sorted = group.OrderBy(e => e.Id).ToList();
            // Only add if not already marked for deletion
            foreach (var emp in sorted.Skip(1))
            {
                if (!employeesToDelete.Any(e => e.Id == emp.Id))
                {
                    employeesToDelete.Add(emp);
                }
            }
        }

        // Remove duplicates
        if (employeesToDelete.Any())
        {
            db.Employees.RemoveRange(employeesToDelete);
            db.SaveChanges();
            Console.WriteLine($"Removed {employeesToDelete.Count} duplicate employee(s) from database");
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Warning: Could not remove duplicate employees: {ex.Message}");
    }

    // Note: Employee seeding is handled by ApplicationDbContext.HasData() during migrations
    // This ensures employees are only seeded once via Entity Framework migrations
    // The duplicate removal above handles cases where employees were seeded multiple times

    // Remove duplicate departments (keep the oldest record by ID)
    // This prevents duplicates from multiple seeding sources (ApplicationDbContext, Program.cs, SQL scripts)
    try
    {
        var allDepartments = db.Departments.ToList();
        var departmentsToDelete = new List<Department>();

        // Find duplicates by Name (case-insensitive)
        var nameGroups = allDepartments
            .Where(d => !string.IsNullOrEmpty(d.Name))
            .GroupBy(d => d.Name.ToLower())
            .Where(g => g.Count() > 1)
            .ToList();
        
        foreach (var group in nameGroups)
        {
            var sorted = group.OrderBy(d => d.Id).ToList();
            // Keep the first (oldest), mark the rest for deletion
            departmentsToDelete.AddRange(sorted.Skip(1));
        }

        // Remove duplicates
        if (departmentsToDelete.Any())
        {
            db.Departments.RemoveRange(departmentsToDelete);
            db.SaveChanges();
            Console.WriteLine($"Removed {departmentsToDelete.Count} duplicate department(s) from database");
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Warning: Could not remove duplicate departments: {ex.Message}");
    }

    // Note: Department seeding is handled by ApplicationDbContext.HasData() during migrations
    // This ensures departments are only seeded once via Entity Framework migrations
    // The duplicate removal above handles cases where departments were seeded multiple times

    // Ensure all employees have user accounts for login
    try
    {
        var employeesWithoutUsers = db.Employees
            .Where(e => e.UserId == null && !string.IsNullOrEmpty(e.Email))
            .ToList();
        
        if (employeesWithoutUsers.Any())
        {
            var existingUserEmails = db.Users.Select(u => u.Email.ToLower()).ToList();
            var usersToCreate = new List<User>();
            var maxUserId = db.Users.Any() ? db.Users.Max(u => u.Id) : 0;
            var nextUserId = maxUserId + 1;
            
            foreach (var emp in employeesWithoutUsers)
            {
                // Skip if user with this email already exists
                if (existingUserEmails.Contains(emp.Email.ToLower()))
                {
                    // Try to link to existing user
                    var existingUser = db.Users.FirstOrDefault(u => u.Email.ToLower() == emp.Email.ToLower());
                    if (existingUser != null)
                    {
                        emp.UserId = existingUser.Id;
                        continue;
                    }
                }
                
                // Determine user role based on employee role/position
                var userRole = emp.Role switch
                {
                    "Manager" => "Admin",
                    "Supervisor" => "Supervisor",
                    "Team Lead" => "Team Lead",
                    _ => "Agent" // Agent, Director, or any other role defaults to Agent
                };
                
                // Create user account
                var newUser = new User
                {
                    Id = nextUserId++,
                    Username = emp.Email,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("employee123"), // Default password
                    Email = emp.Email,
                    FullName = emp.FullName,
                    Role = userRole,
                    CreatedAt = DateTime.UtcNow
                };
                
                usersToCreate.Add(newUser);
                emp.UserId = newUser.Id;
                existingUserEmails.Add(emp.Email.ToLower());
            }
            
            if (usersToCreate.Any())
            {
                db.Users.AddRange(usersToCreate);
                db.SaveChanges();
                Console.WriteLine($"Created {usersToCreate.Count} user account(s) for employees without login access");
            }
            
            if (employeesWithoutUsers.Any(e => e.UserId != null))
            {
                db.SaveChanges();
            }
        }
        
        // Update existing user roles to match employee roles
        var employeesWithUsers = db.Employees
            .Where(e => e.UserId != null && !string.IsNullOrEmpty(e.Email))
            .Include(e => e.Department)
            .ToList();
        
        var rolesUpdated = 0;
        foreach (var emp in employeesWithUsers)
        {
            var user = db.Users.FirstOrDefault(u => u.Id == emp.UserId);
            if (user != null)
            {
                // Determine correct user role based on employee role
                var correctRole = emp.Role switch
                {
                    "Manager" => "Admin",
                    "Supervisor" => "Supervisor",
                    "Team Lead" => "Team Lead",
                    _ => "Agent" // Agent, Director, or any other role defaults to Agent
                };
                
                // Update role if it doesn't match
                if (user.Role != correctRole)
                {
                    user.Role = correctRole;
                    rolesUpdated++;
                }
            }
        }
        
        if (rolesUpdated > 0)
        {
            db.SaveChanges();
            Console.WriteLine($"Updated {rolesUpdated} user role(s) to match employee positions");
        }
        
        // Verify all employees can login - Display login information
        var allEmployees = db.Employees
            .Where(e => !string.IsNullOrEmpty(e.Email))
            .ToList();
        
        var employeesWithLogin = allEmployees.Count(e => e.UserId != null);
        var employeesWithoutLogin = allEmployees.Count(e => e.UserId == null);
        
        Console.WriteLine("=== Employee Login Status ===");
        Console.WriteLine($"Total Employees: {allEmployees.Count}");
        Console.WriteLine($"Employees with Login Accounts: {employeesWithLogin}");
        Console.WriteLine($"Employees without Login Accounts: {employeesWithoutLogin}");
        
        if (employeesWithLogin > 0)
        {
            Console.WriteLine("\n✅ All employees can login using their email address and password: employee123");
            Console.WriteLine("   (Managers have Admin access, Supervisors/Team Leads have respective roles, others have Agent access)");
        }
        
        if (employeesWithoutLogin > 0)
        {
            Console.WriteLine($"\n⚠️  Warning: {employeesWithoutLogin} employee(s) do not have login accounts");
            foreach (var emp in allEmployees.Where(e => e.UserId == null))
            {
                Console.WriteLine($"   - {emp.FullName} ({emp.Email})");
            }
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Warning: Could not create user accounts for employees: {ex.Message}");
    }

    // Note: Employee seeding is handled by ApplicationDbContext.HasData() during migrations
    // This ensures employees are only seeded once via Entity Framework migrations
    // The duplicate removal above handles cases where employees were seeded multiple times

    // Ensure mock user data exists
    if (!db.Users.Any())
    {
        var adminUser = new User
        {
            Username = "admin",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
            Email = "admin@excell-on.com",
            FullName = "Administrator",
            Role = "Admin",
            CreatedAt = DateTime.UtcNow
        };
        db.Users.Add(adminUser);
        
        // Test accounts removed - only real employee accounts are created via ApplicationDbContext seed data
        db.SaveChanges();
    }
    else
    {
        // Remove test accounts if they exist (cleanup)
        var testUsers = db.Users.Where(u => 
            u.Username == "user" || 
            u.Username == "manager" ||
            u.Email == "user@transportinfo.com" ||
            u.Email == "manager@transportinfo.com"
        ).ToList();
        
        if (testUsers.Any())
        {
            db.Users.RemoveRange(testUsers);
            db.SaveChanges();
            Console.WriteLine($"Removed {testUsers.Count} test user account(s)");
        }
    }
}

app.Run();

