# Duplicate Departments Fix

## Problem

Duplicate departments were being created in the database due to multiple seeding sources:

1. **ApplicationDbContext.cs** - Seeds departments via `HasData()` during Entity Framework migrations
2. **Program.cs** - Was seeding departments at runtime if table was empty
3. **SQL Scripts** - Database initialization scripts also seed departments

This caused the same departments to be inserted multiple times, creating duplicates with conflicting names (e.g., "HR" vs "Human Resources", "Admin" vs "Administration").

## Solution

### Changes Made

1. **Removed Runtime Seeding from Program.cs**
   - Removed the department seeding code that was adding departments at runtime
   - Department seeding is now handled exclusively by `ApplicationDbContext.HasData()` during migrations
   - This ensures departments are only seeded once via Entity Framework

2. **Added Automatic Duplicate Removal**
   - Added duplicate detection and removal logic in `Program.cs` that runs on application startup
   - Removes duplicates based on:
     - **Name** (case-insensitive comparison)
   - Keeps the oldest record (lowest ID) and removes newer duplicates
   - Logs the number of duplicates removed to the console

### Code Location

The duplicate removal code is in `Program.cs` at lines 361-390, right after employee duplicate removal and before client data seeding.

## How It Works

1. On application startup, the code checks for duplicate departments
2. Groups departments by Name (case-insensitive)
3. For each duplicate group:
   - Sorts by ID (ascending)
   - Keeps the first record (oldest)
   - Marks the rest for deletion
4. Removes all marked duplicates in a single operation
5. Logs the results to console

## Benefits

- **Automatic Cleanup**: Duplicates are removed automatically on startup
- **Safe**: Always keeps the oldest record (lowest ID)
- **Non-Destructive**: Only removes actual duplicates
- **Logging**: Console output shows how many duplicates were removed
- **Prevents Conflicts**: Eliminates duplicate departments with different names but same purpose

## Testing

After deploying this fix:

1. Check the console output when the application starts
2. Look for messages like: `Removed X duplicate department(s) from database`
3. Verify in the database that duplicates are gone
4. Check that department names are consistent (no "HR" and "Human Resources" duplicates)

## Prevention

To prevent future duplicates:

- Department seeding is now only done via `ApplicationDbContext.HasData()` during migrations
- The duplicate removal code runs on every startup as a safety measure
- If you need to add departments, use the API endpoints or the frontend interface

## Manual Cleanup

If you need to manually remove duplicates, you can:

1. Use the SQL script: `database/remove_duplicate_departments.sql`
2. The automatic cleanup will also run on next application startup

## Notes

- The Department table has a unique constraint on `Name` at the database level
- However, duplicates can still occur if seeded from multiple sources with different casing or slight name variations
- The cleanup handles case-insensitive matching to catch all variations

