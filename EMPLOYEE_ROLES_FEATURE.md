# Employee Roles Feature

## Overview

Added role management functionality for employees in the Admin section. Employees can now be assigned roles (Agent, Team Lead, Supervisor, Manager, Director) which are displayed and editable in the employee management interface.

## Changes Made

### Backend Changes

1. **Employee Model** (`Models/Employee.cs`)
   - Added `Role` property with default value "Agent"
   - Role options: Agent, Team Lead, Supervisor, Manager, Director

2. **Database Migration** (`Migrations/20250102000000_AddEmployeeRole.cs`)
   - Created migration to add `Role` column to `Employees` table
   - Sets default value "Agent" for existing employees
   - Automatically assigns roles based on position titles:
     - Manager/Director → Manager
     - Lead/Supervisor → Team Lead
     - Coordinator → Supervisor
     - Others → Agent

3. **Seed Data** (`Data/ApplicationDbContext.cs`)
   - Updated employee seed data to include appropriate roles:
     - Managers → "Manager"
     - Team Leads → "Team Lead"
     - Supervisors → "Supervisor"
     - Others → "Agent"

### Frontend Changes

1. **Type Definitions** (`types/api.ts`)
   - Added `role: string` field to `Employee` interface

2. **Employee Management Page** (`app/employees/page.tsx`)
   - Added role field to form state
   - Added role dropdown in add/edit form with options:
     - Agent
     - Team Lead
     - Supervisor
     - Manager
     - Director
   - Added role column to employees table with color-coded badges:
     - Manager/Director: Purple badge
     - Supervisor/Team Lead: Blue badge
     - Agent: Gray badge
   - Added role display in view modal
   - Updated form handlers to include role in create/update operations

3. **Data Transformation** (`utils/dataTransform.ts`)
   - Updated `formToApi.employee()` to include role field
   - Defaults to "Agent" if not provided

## Role Hierarchy

1. **Agent** (Default)
   - Entry-level employees
   - Standard operational staff

2. **Team Lead**
   - Leads small teams
   - Provides guidance to agents

3. **Supervisor**
   - Oversees team operations
   - Manages team leads and agents

4. **Manager**
   - Department or service managers
   - Strategic decision making

5. **Director**
   - Executive level
   - High-level strategic oversight

## Usage

### For Administrators

1. **Viewing Roles**
   - Roles are displayed in the employees table with color-coded badges
   - Roles are also shown in the employee detail view modal

2. **Assigning Roles**
   - When creating a new employee, select a role from the dropdown
   - When editing an employee, update the role as needed
   - Role is required and defaults to "Agent"

3. **Filtering by Role**
   - Can be added as a filter option in future updates
   - Currently visible in table view for quick identification

## Database Migration

To apply the changes to your database:

```bash
cd D:\Code\Sem3\ppj3\src\TransportInfoManagement.API
dotnet ef database update
```

Or manually run the SQL:

```sql
ALTER TABLE Employees 
ADD COLUMN Role VARCHAR(50) NOT NULL DEFAULT 'Agent';

UPDATE Employees 
SET Role = CASE 
    WHEN Position LIKE '%Manager%' OR Position LIKE '%Director%' THEN 'Manager'
    WHEN Position LIKE '%Lead%' OR Position LIKE '%Supervisor%' THEN 'Team Lead'
    WHEN Position LIKE '%Coordinator%' THEN 'Supervisor'
    ELSE 'Agent'
END;
```

## Benefits

- **Clear Hierarchy**: Visual representation of organizational structure
- **Easy Management**: Simple dropdown interface for role assignment
- **Visual Identification**: Color-coded badges for quick role recognition
- **Flexible**: Can be updated as organizational needs change
- **Backward Compatible**: Existing employees default to "Agent" role

## Future Enhancements

- Add role-based filtering in the employees table
- Implement role-based permissions/access control
- Add role statistics dashboard
- Export employees grouped by role
- Role-based reporting and analytics

