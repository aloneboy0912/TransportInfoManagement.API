# Employee Login Accounts

## Overview
All employees in the system now have user accounts that can be used to login to the application. This allows employees to access the system using their email addresses and a default password.

## Implementation Details

### User Account Creation
- **Seed Data**: User accounts are created automatically via Entity Framework migrations in `ApplicationDbContext.cs`
- **Runtime Creation**: The application automatically creates user accounts for any employees that don't have them when the application starts (in `Program.cs`)

### Login Credentials

#### Default Password
All employee accounts use the default password: **`employee123`**

#### Username/Email
Employees can login using their email address (e.g., `john.smith@excell-on.com`)

### Employee Accounts

The following employee accounts have been created:

| Employee | Email | Password | Role | User Role |
|----------|-------|----------|------|-----------|
| John Smith | john.smith@excell-on.com | employee123 | Agent | User |
| Sarah Johnson | sarah.johnson@excell-on.com | employee123 | Manager | Admin |
| Michael Brown | michael.brown@excell-on.com | employee123 | Agent | User |
| Emily Davis | emily.davis@excell-on.com | employee123 | Manager | Admin |
| David Wilson | david.wilson@excell-on.com | employee123 | Agent | User |
| Jessica Martinez | jessica.martinez@excell-on.com | employee123 | Supervisor | User |
| Robert Taylor | robert.taylor@excell-on.com | employee123 | Agent | User |
| Lisa Anderson | lisa.anderson@excell-on.com | employee123 | Agent | User |
| James Thomas | james.thomas@excell-on.com | employee123 | Team Lead | User |
| Amanda White | amanda.white@excell-on.com | employee123 | Agent | User |
| Christopher Lee | christopher.lee@excell-on.com | employee123 | Agent | User |
| Michelle Harris | michelle.harris@excell-on.com | employee123 | Supervisor | User |

### Role Mapping

- **Manager** employees → **Admin** user role (full access)
- **All other roles** (Agent, Supervisor, Team Lead) → **User** role (limited access)

### Admin Account

The default admin account remains:
- **Username**: `admin`
- **Email**: `admin@excell-on.com`
- **Password**: `admin123`
- **Role**: Admin

## How to Login

1. Navigate to the login page
2. Enter the employee's email address (e.g., `john.smith@excell-on.com`) in the username field
3. Enter the password: `employee123`
4. Click Login

**Note**: The login system accepts both username and email, so employees can use either their email address or username to login.

## Automatic Account Creation

When new employees are added to the system:
- If an employee has an email address but no user account, the system will automatically create one on startup
- The default password will be `employee123`
- The user role will be determined based on the employee's role (Manager → Admin, others → User)

## Security Notes

⚠️ **Important**: The default password `employee123` should be changed in production environments. Consider:
- Implementing a password reset flow
- Requiring password change on first login
- Using stronger default passwords or temporary passwords

## Database Migration

To apply these changes to your database, run:

```bash
dotnet ef migrations add AddEmployeeUserAccounts
dotnet ef database update
```

Or if migrations are already applied, the user accounts will be created automatically on the next application startup.

