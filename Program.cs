using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using TransportInfoManagement.API.Data;
using TransportInfoManagement.API.Models;
using TransportInfoManagement.API.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
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
            Console.WriteLine("   (Managers have Admin access, others have User access)");
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

    // Ensure mock client data exists
    if (!db.Clients.Any())
    {
        var baseDate = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        var clients = new List<Client>
        {
            new Client { Id = 1, ClientCode = "CLI001", CompanyName = "Tech Solutions Inc.", ContactPerson = "Robert Chen", Email = "robert.chen@techsolutions.com", Phone = "+1-555-1001", Address = "123 Tech Street", City = "San Francisco", Country = "USA", IsActive = true, CreatedAt = baseDate.AddDays(-180) },
            new Client { Id = 2, ClientCode = "CLI002", CompanyName = "Global Enterprises Ltd.", ContactPerson = "Maria Garcia", Email = "maria.garcia@globalent.com", Phone = "+1-555-1002", Address = "456 Business Ave", City = "New York", Country = "USA", IsActive = true, CreatedAt = baseDate.AddDays(-150) },
            new Client { Id = 3, ClientCode = "CLI003", CompanyName = "Digital Innovations Corp.", ContactPerson = "James Wilson", Email = "james.wilson@digitalinnov.com", Phone = "+1-555-1003", Address = "789 Innovation Blvd", City = "Seattle", Country = "USA", IsActive = true, CreatedAt = baseDate.AddDays(-120) },
            new Client { Id = 4, ClientCode = "CLI004", CompanyName = "Premier Services Group", ContactPerson = "Sarah Thompson", Email = "sarah.thompson@premierservices.com", Phone = "+1-555-1004", Address = "321 Service Road", City = "Chicago", Country = "USA", IsActive = true, CreatedAt = baseDate.AddDays(-200) },
            new Client { Id = 5, ClientCode = "CLI005", CompanyName = "Advanced Systems Co.", ContactPerson = "Michael Rodriguez", Email = "michael.rodriguez@advancedsys.com", Phone = "+1-555-1005", Address = "654 System Drive", City = "Austin", Country = "USA", IsActive = true, CreatedAt = baseDate.AddDays(-90) },
            new Client { Id = 6, ClientCode = "CLI006", CompanyName = "Elite Business Partners", ContactPerson = "Jennifer Martinez", Email = "jennifer.martinez@elitebiz.com", Phone = "+1-555-1006", Address = "987 Elite Plaza", City = "Los Angeles", Country = "USA", IsActive = true, CreatedAt = baseDate.AddDays(-60) },
            new Client { Id = 7, ClientCode = "CLI007", CompanyName = "Strategic Solutions LLC", ContactPerson = "David Kim", Email = "david.kim@strategicsol.com", Phone = "+1-555-1007", Address = "147 Strategy Lane", City = "Boston", Country = "USA", IsActive = true, CreatedAt = baseDate.AddDays(-250) },
            new Client { Id = 8, ClientCode = "CLI008", CompanyName = "Prime Consulting Group", ContactPerson = "Lisa Anderson", Email = "lisa.anderson@primeconsult.com", Phone = "+1-555-1008", Address = "258 Prime Street", City = "Denver", Country = "USA", IsActive = true, CreatedAt = baseDate.AddDays(-100) },
            new Client { Id = 9, ClientCode = "CLI009", CompanyName = "Modern Tech Solutions", ContactPerson = "Christopher Brown", Email = "christopher.brown@moderntech.com", Phone = "+1-555-1009", Address = "369 Modern Way", City = "Portland", Country = "USA", IsActive = true, CreatedAt = baseDate.AddDays(-75) },
            new Client { Id = 10, ClientCode = "CLI010", CompanyName = "Excellence Corporation", ContactPerson = "Amanda White", Email = "amanda.white@excellencecorp.com", Phone = "+1-555-1010", Address = "741 Excellence Blvd", City = "Miami", Country = "USA", IsActive = true, CreatedAt = baseDate.AddDays(-45) },
            new Client { Id = 11, ClientCode = "CLI011", CompanyName = "Innovation Hub Inc.", ContactPerson = "Daniel Lee", Email = "daniel.lee@innovationhub.com", Phone = "+1-555-1011", Address = "852 Innovation Center", City = "San Diego", Country = "USA", IsActive = true, CreatedAt = baseDate.AddDays(-30) },
            new Client { Id = 12, ClientCode = "CLI012", CompanyName = "Professional Services Co.", ContactPerson = "Nicole Taylor", Email = "nicole.taylor@profservices.com", Phone = "+1-555-1012", Address = "963 Professional Park", City = "Phoenix", Country = "USA", IsActive = true, CreatedAt = baseDate.AddDays(-20) }
        };
        db.Clients.AddRange(clients);
        db.SaveChanges();
    }

    // Ensure mock client service data exists
    if (!db.ClientServices.Any())
    {
        var baseDate = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        var clientServices = new List<ClientService>
        {
            new ClientService { Id = 1, ClientId = 1, ServiceId = 1, EmployeeId = 1, NumberOfEmployees = 3, StartDate = baseDate.AddDays(-150), EndDate = null, IsActive = true, CreatedAt = baseDate.AddDays(-150) },
            new ClientService { Id = 2, ClientId = 2, ServiceId = 2, EmployeeId = 2, NumberOfEmployees = 5, StartDate = baseDate.AddDays(-120), EndDate = null, IsActive = true, CreatedAt = baseDate.AddDays(-120) },
            new ClientService { Id = 3, ClientId = 3, ServiceId = 3, EmployeeId = 3, NumberOfEmployees = 2, StartDate = baseDate.AddDays(-100), EndDate = baseDate.AddDays(-10), IsActive = false, CreatedAt = baseDate.AddDays(-100) },
            new ClientService { Id = 4, ClientId = 4, ServiceId = 1, EmployeeId = 4, NumberOfEmployees = 4, StartDate = baseDate.AddDays(-180), EndDate = null, IsActive = true, CreatedAt = baseDate.AddDays(-180) },
            new ClientService { Id = 5, ClientId = 5, ServiceId = 2, EmployeeId = 5, NumberOfEmployees = 6, StartDate = baseDate.AddDays(-80), EndDate = null, IsActive = true, CreatedAt = baseDate.AddDays(-80) },
            new ClientService { Id = 6, ClientId = 6, ServiceId = 3, EmployeeId = 6, NumberOfEmployees = 3, StartDate = baseDate.AddDays(-60), EndDate = null, IsActive = true, CreatedAt = baseDate.AddDays(-60) },
            new ClientService { Id = 7, ClientId = 7, ServiceId = 1, EmployeeId = 7, NumberOfEmployees = 2, StartDate = baseDate.AddDays(-200), EndDate = null, IsActive = true, CreatedAt = baseDate.AddDays(-200) },
            new ClientService { Id = 8, ClientId = 8, ServiceId = 2, EmployeeId = 8, NumberOfEmployees = 4, StartDate = baseDate.AddDays(-90), EndDate = baseDate.AddDays(-5), IsActive = false, CreatedAt = baseDate.AddDays(-90) },
            new ClientService { Id = 9, ClientId = 9, ServiceId = 3, EmployeeId = 9, NumberOfEmployees = 5, StartDate = baseDate.AddDays(-70), EndDate = null, IsActive = true, CreatedAt = baseDate.AddDays(-70) },
            new ClientService { Id = 10, ClientId = 10, ServiceId = 1, EmployeeId = 10, NumberOfEmployees = 3, StartDate = baseDate.AddDays(-40), EndDate = null, IsActive = true, CreatedAt = baseDate.AddDays(-40) },
            new ClientService { Id = 11, ClientId = 11, ServiceId = 2, EmployeeId = 11, NumberOfEmployees = 4, StartDate = baseDate.AddDays(-30), EndDate = null, IsActive = true, CreatedAt = baseDate.AddDays(-30) },
            new ClientService { Id = 12, ClientId = 12, ServiceId = 3, EmployeeId = 12, NumberOfEmployees = 2, StartDate = baseDate.AddDays(-20), EndDate = null, IsActive = true, CreatedAt = baseDate.AddDays(-20) },
            new ClientService { Id = 13, ClientId = 1, ServiceId = 2, EmployeeId = 2, NumberOfEmployees = 3, StartDate = baseDate.AddDays(-50), EndDate = null, IsActive = true, CreatedAt = baseDate.AddDays(-50) },
            new ClientService { Id = 14, ClientId = 2, ServiceId = 1, EmployeeId = 1, NumberOfEmployees = 4, StartDate = baseDate.AddDays(-110), EndDate = null, IsActive = true, CreatedAt = baseDate.AddDays(-110) },
            new ClientService { Id = 15, ClientId = 3, ServiceId = 1, EmployeeId = 4, NumberOfEmployees = 2, StartDate = baseDate.AddDays(-85), EndDate = null, IsActive = true, CreatedAt = baseDate.AddDays(-85) }
        };
        db.ClientServices.AddRange(clientServices);
        db.SaveChanges();
    }
    // Ensure mock user data exists
    if (!db.Users.Any())
    {
        var adminUser = new User
        {
            Username = "admin",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
            Email = "admin@transportinfo.com",
            FullName = "System Administrator",
            Role = "Admin",
            CreatedAt = DateTime.UtcNow
        };
        db.Users.Add(adminUser);
        
        var normalUser = new User
        {
            Username = "user",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("user123"),
            Email = "user@transportinfo.com",
            FullName = "Normal User",
            Role = "User",
            CreatedAt = DateTime.UtcNow
        };
        db.Users.Add(normalUser);

        var managerUser = new User
        {
            Username = "manager",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("manager123"),
            Email = "manager@transportinfo.com",
            FullName = "Manager User",
            Role = "Manager",
            CreatedAt = DateTime.UtcNow
        };
        db.Users.Add(managerUser);

        db.SaveChanges();
    }
    else
    {
        // Check and add missing roles if users table already has data but missing specific roles
        if (!db.Users.Any(u => u.Username == "user"))
        {
            var normalUser = new User
            {
                Username = "user",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("user123"),
                Email = "user@transportinfo.com",
                FullName = "Normal User",
                Role = "User",
                CreatedAt = DateTime.UtcNow
            };
            db.Users.Add(normalUser);
        }

        if (!db.Users.Any(u => u.Username == "manager"))
        {
            var managerUser = new User
            {
                Username = "manager",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("manager123"),
                Email = "manager@transportinfo.com",
                FullName = "Manager User",
                Role = "Manager",
                CreatedAt = DateTime.UtcNow
            };
            db.Users.Add(managerUser);
        }
        
        if (db.ChangeTracker.HasChanges())
        {
            db.SaveChanges();
        }
    }
}

app.Run();

