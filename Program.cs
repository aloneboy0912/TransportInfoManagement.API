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
    // Fallback to admin login if login.html doesn't exist
    var adminFilePath = Path.Combine(env.WebRootPath, "index.html");
    if (File.Exists(adminFilePath))
    {
        context.Response.ContentType = "text/html";
        await context.Response.SendFileAsync(adminFilePath);
    }
});



// Admin panel route - also serve admin panel at /admin for compatibility
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
    
    // Ensure mock department data exists
    if (!db.Departments.Any())
    {
        var departments = new List<Department>
        {
            new Department { Id = 1, Name = "Human Resources", Description = "HR Department", IsActive = true, CreatedAt = DateTime.UtcNow },
            new Department { Id = 2, Name = "Administration", Description = "Admin Department", IsActive = true, CreatedAt = DateTime.UtcNow },
            new Department { Id = 3, Name = "Operations", Description = "Operations Department", IsActive = true, CreatedAt = DateTime.UtcNow },
            new Department { Id = 4, Name = "Training", Description = "Training Department", IsActive = true, CreatedAt = DateTime.UtcNow },
            new Department { Id = 5, Name = "Security", Description = "Security Department", IsActive = true, CreatedAt = DateTime.UtcNow },
            new Department { Id = 6, Name = "Quality Assurance", Description = "QA Department", IsActive = true, CreatedAt = DateTime.UtcNow }
        };
        db.Departments.AddRange(departments);
        db.SaveChanges();
    }

    // Ensure mock service data exists
    if (!db.Services.Any())
    {
        var servicesList = new List<Service>
        {
            new Service { Id = 1, Name = "Inbound Support", Description = "Receiving calls from customers", IsActive = true, CreatedAt = DateTime.UtcNow },
            new Service { Id = 2, Name = "Outbound Sales", Description = "Staff proactively calling customers", IsActive = true, CreatedAt = DateTime.UtcNow },
            new Service { Id = 3, Name = "Telemarketing", Description = "Marketing and sales services via telephone", IsActive = true, CreatedAt = DateTime.UtcNow }
        };
        db.Services.AddRange(servicesList);
        db.SaveChanges();
    }

    // Update existing service descriptions to English
    var services = db.Services.ToList();
    foreach (var service in services)
    {
        switch (service.Id)
        {
            case 1:
                if (service.Description.Contains("Nhận cuộc gọi"))
                    service.Description = "Receiving calls from customers";
                break;
            case 2:
                if (service.Description.Contains("Nhân viên chủ động"))
                    service.Description = "Staff proactively calling customers";
                break;
            case 3:
                if (service.Description.Contains("Dịch vụ tiếp thị"))
                    service.Description = "Marketing and sales services via telephone";
                break;
        }
    }
    db.SaveChanges();

    // Ensure mock employee data exists
    if (!db.Employees.Any())
    {
        var baseDate = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        var employees = new List<Employee>
        {
            new Employee { Id = 1, EmployeeCode = "EMP001", FullName = "John Smith", Email = "john.smith@excell-on.com", Phone = "+1-555-0101", Position = "Customer Service Representative", ServiceId = 1, DepartmentId = 3, HireDate = baseDate.AddDays(-120), IsActive = true, CreatedAt = baseDate.AddDays(-120) },
            new Employee { Id = 2, EmployeeCode = "EMP002", FullName = "Sarah Johnson", Email = "sarah.johnson@excell-on.com", Phone = "+1-555-0102", Position = "Sales Manager", ServiceId = 2, DepartmentId = 3, HireDate = baseDate.AddDays(-200), IsActive = true, CreatedAt = baseDate.AddDays(-200) },
            new Employee { Id = 3, EmployeeCode = "EMP003", FullName = "Michael Brown", Email = "michael.brown@excell-on.com", Phone = "+1-555-0103", Position = "Telemarketing Specialist", ServiceId = 3, DepartmentId = 3, HireDate = baseDate.AddDays(-90), IsActive = true, CreatedAt = baseDate.AddDays(-90) },
            new Employee { Id = 4, EmployeeCode = "EMP004", FullName = "Emily Davis", Email = "emily.davis@excell-on.com", Phone = "+1-555-0104", Position = "HR Manager", ServiceId = 1, DepartmentId = 1, HireDate = baseDate.AddDays(-300), IsActive = true, CreatedAt = baseDate.AddDays(-300) },
            new Employee { Id = 5, EmployeeCode = "EMP005", FullName = "David Wilson", Email = "david.wilson@excell-on.com", Phone = "+1-555-0105", Position = "Administrative Assistant", ServiceId = 1, DepartmentId = 2, HireDate = baseDate.AddDays(-60), IsActive = true, CreatedAt = baseDate.AddDays(-60) },
            new Employee { Id = 6, EmployeeCode = "EMP006", FullName = "Jessica Martinez", Email = "jessica.martinez@excell-on.com", Phone = "+1-555-0106", Position = "Training Coordinator", ServiceId = 2, DepartmentId = 4, HireDate = baseDate.AddDays(-150), IsActive = true, CreatedAt = baseDate.AddDays(-150) },
            new Employee { Id = 7, EmployeeCode = "EMP007", FullName = "Robert Taylor", Email = "robert.taylor@excell-on.com", Phone = "+1-555-0107", Position = "Security Analyst", ServiceId = 1, DepartmentId = 5, HireDate = baseDate.AddDays(-180), IsActive = true, CreatedAt = baseDate.AddDays(-180) },
            new Employee { Id = 8, EmployeeCode = "EMP008", FullName = "Lisa Anderson", Email = "lisa.anderson@excell-on.com", Phone = "+1-555-0108", Position = "Auditor", ServiceId = 3, DepartmentId = 6, HireDate = baseDate.AddDays(-100), IsActive = true, CreatedAt = baseDate.AddDays(-100) },
            new Employee { Id = 9, EmployeeCode = "EMP009", FullName = "James Thomas", Email = "james.thomas@excell-on.com", Phone = "+1-555-0109", Position = "Customer Support Lead", ServiceId = 1, DepartmentId = 3, HireDate = baseDate.AddDays(-250), IsActive = true, CreatedAt = baseDate.AddDays(-250) },
            new Employee { Id = 10, EmployeeCode = "EMP010", FullName = "Amanda White", Email = "amanda.white@excell-on.com", Phone = "+1-555-0110", Position = "Sales Representative", ServiceId = 2, DepartmentId = 3, HireDate = baseDate.AddDays(-45), IsActive = true, CreatedAt = baseDate.AddDays(-45) },
            new Employee { Id = 11, EmployeeCode = "EMP011", FullName = "Christopher Lee", Email = "christopher.lee@excell-on.com", Phone = "+1-555-0111", Position = "Marketing Specialist", ServiceId = 3, DepartmentId = 3, HireDate = baseDate.AddDays(-75), IsActive = true, CreatedAt = baseDate.AddDays(-75) },
            new Employee { Id = 12, EmployeeCode = "EMP012", FullName = "Michelle Harris", Email = "michelle.harris@excell-on.com", Phone = "+1-555-0112", Position = "HR Coordinator", ServiceId = 1, DepartmentId = 1, HireDate = baseDate.AddDays(-30), IsActive = true, CreatedAt = baseDate.AddDays(-30) }
        };
        db.Employees.AddRange(employees);
        db.SaveChanges();
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

