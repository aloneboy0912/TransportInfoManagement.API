# Department Structure - Excell-On Services

## Overview
Based on the Excell-On Services requirements document, the system maintains details of different departments. Employees are assigned to departments based on their roles and responsibilities.

## Departments

### 1. HR Management
**Description**: Human Resources Management

**Responsibilities**:
- Employee recruitment and hiring
- Employee relations
- Performance management
- HR policy implementation

**Employee Roles**:
- **Manager** - HR Manager (oversees HR operations)
- **Supervisor** - HR Coordinator (coordinates HR activities)
- **Agent** - HR Assistant (handles day-to-day HR tasks)

**Current Employees**:
- Emily Davis - HR Manager (Manager role)
- Michelle Harris - HR Coordinator (Supervisor role)

---

### 2. Administration
**Description**: Administration Department

**Responsibilities**:
- Administrative support
- Office management
- Document management
- General administrative tasks

**Employee Roles**:
- **Manager** - Admin Manager (oversees administrative operations)
- **Agent** - Administrative Assistant (handles administrative tasks)

**Current Employees**:
- David Wilson - Administrative Assistant (Agent role)

---

### 3. Service
**Description**: Service Department

**Responsibilities**:
- Customer service operations
- Service delivery
- Client relationship management
- Service quality assurance

**Employee Roles**:
- **Manager** - Service Manager (manages service operations)
- **Team Lead** - Service Team Lead (leads service teams)
- **Supervisor** - Service Supervisor (supervises service operations)
- **Agent** - Service Agent (handles service delivery)

**Current Employees**:
- John Smith - Customer Service Representative (Agent role)
- Sarah Johnson - Sales Manager (Manager role)
- Michael Brown - Telemarketing Specialist (Agent role)
- James Thomas - Customer Support Lead (Team Lead role)
- Amanda White - Sales Representative (Agent role)
- Christopher Lee - Marketing Specialist (Agent role)

---

### 4. Training
**Description**: Training Department

**Responsibilities**:
- Employee training programs
- Skills development
- Training coordination
- Performance improvement

**Employee Roles**:
- **Manager** - Training Manager (oversees training programs)
- **Supervisor** - Training Coordinator (coordinates training activities)
- **Agent** - Training Specialist (conducts training sessions)

**Current Employees**:
- Jessica Martinez - Training Coordinator (Supervisor role)

---

### 5. Internet Security
**Description**: It will take care of any technical related issues and problems like PC of an employee is hanged, PC of an employee is not getting started, One of the software application is not running properly, installing and uninstalling software, etc.

**Responsibilities**:
- Technical support for employees
- PC troubleshooting and repair
- Software installation and uninstallation
- Application troubleshooting
- System maintenance
- IT security management

**Employee Roles**:
- **Manager** - IT Security Manager (oversees IT operations)
- **Supervisor** - IT Supervisor (supervises technical support)
- **Agent** - Security Analyst / IT Support (handles technical issues)

**Current Employees**:
- Robert Taylor - Security Analyst (Agent role)

---

### 6. Auditors
**Description**: Auditing Department

**Responsibilities**:
- Financial auditing
- Process auditing
- Compliance auditing
- Quality assurance auditing

**Employee Roles**:
- **Manager** - Audit Manager (oversees audit operations)
- **Supervisor** - Senior Auditor (supervises audit activities)
- **Agent** - Auditor (conducts audits)

**Current Employees**:
- Lisa Anderson - Auditor (Agent role)

---

## Employee Role Hierarchy by Department

### Role Structure
All departments follow a consistent role hierarchy:

1. **Agent** - Entry-level or operational role
   - Handles day-to-day tasks
   - Reports to Team Lead or Supervisor

2. **Team Lead** - Leadership role
   - Leads small teams
   - Coordinates team activities
   - Reports to Supervisor or Manager

3. **Supervisor** - Mid-level management
   - Oversees teams and operations
   - Ensures quality and standards
   - Reports to Manager

4. **Manager** - Senior management
   - Manages department operations
   - Strategic planning
   - Full administrative access

5. **Director** - Executive level
   - Highest level of management
   - Strategic oversight
   - Full system access

## Department Assignment Rules

1. **Service Department** employees are typically assigned to one of the three services:
   - In-bound Services
   - Out-bound Services
   - Tele Marketing Services

2. **Support Departments** (HR, Admin, Training, Internet Security, Auditors) may have employees working across multiple services or providing support to all services.

3. **Role Assignment** is based on:
   - Employee's designation/position
   - Department requirements
   - Service requirements (for Service Department)

## Database Structure

### Department Table
- `Id` - Primary key
- `Name` - Department name (exact match to requirements)
- `Description` - Department description
- `IsActive` - Active status
- `CreatedAt` - Creation timestamp

### Employee-Department Relationship
- Each employee has a `DepartmentId` foreign key
- Employees are linked to departments via `DepartmentId`
- Employees can be filtered and grouped by department

## Current Department Assignments Summary

| Department | Employee Count | Roles |
|------------|---------------|-------|
| HR Management | 2 | Manager (1), Supervisor (1) |
| Administration | 1 | Agent (1) |
| Service | 6 | Manager (1), Team Lead (1), Agent (4) |
| Training | 1 | Supervisor (1) |
| Internet Security | 1 | Agent (1) |
| Auditors | 1 | Agent (1) |
| **Total** | **12** | **Manager (2), Supervisor (2), Team Lead (1), Agent (7)** |

## Requirements Compliance

✅ **Requirement Met**: "The different department details are to be maintained"

- All 6 required departments are implemented
- Department names match requirements exactly
- Department descriptions are maintained
- Employees are properly assigned to departments
- Employee roles are appropriate for their departments

