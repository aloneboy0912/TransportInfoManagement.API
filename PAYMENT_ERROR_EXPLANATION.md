# Payment Checkout Error Explanation

## Error Message
```
Error confirming payment: An error occurred while saving the entity changes. See the inner exception for details.
```

## Root Cause

The error occurs because of a **database constraint violation**. Specifically:

### 1. Email Uniqueness Constraint
- The `Clients` table has a **UNIQUE constraint** on the `Email` field
- When trying to create a guest client, if an email already exists in the database, it fails

### 2. The Problem Flow
1. User enters email: `bemon01082005@gmail.com`
2. Backend tries to create a new guest client with this email
3. Database rejects it because email must be unique
4. Error: "An error occurred while saving the entity changes"

### 3. Database Configuration
From `ApplicationDbContext.cs` line 73:
```csharp
entity.HasIndex(e => e.Email).IsUnique(); // Email must be unique!
```

## Solution

We need to:
1. **Check if client exists** before creating a new one
2. **Use existing client** if found by email
3. **Only create new client** if email doesn't exist
4. **Improve error handling** to show detailed errors

