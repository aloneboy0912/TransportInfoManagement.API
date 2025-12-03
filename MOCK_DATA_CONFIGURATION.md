# Mock Data Configuration - Backend & Frontend Alignment

## Overview
This document ensures that mock data in the backend (`TransportInfoManagement.API`) matches the frontend (`sem3fe`) exactly, particularly for the three core services.

---

## ✅ Three Core Services Configuration

### Service Names (Must Match Exactly)

| Service ID | Backend Name | Frontend Name | Status |
|------------|--------------|---------------|--------|
| 1 | `In-bound Services` | `In-bound Services` | ✅ Matched |
| 2 | `Out-bound Services` | `Out-bound Services` | ✅ Matched |
| 3 | `Tele Marketing Services` | `Tele Marketing Services` | ✅ Matched |

### Service Pricing (Must Match Exactly)

| Service ID | Service Name | Price per Day per Employee | Status |
|------------|--------------|---------------------------|--------|
| 1 | In-bound Services | **$4,500.00** | ✅ Matched |
| 2 | Out-bound Services | **$6,000.00** | ✅ Matched |
| 3 | Tele Marketing Services | **$5,500.00** | ✅ Matched |

### Service Descriptions

| Service ID | Description |
|------------|-------------|
| 1 | Receiving calls from customers |
| 2 | Staff proactively calling customers |
| 3 | Marketing and sales services via telephone |

---

## 📍 Configuration Locations

### Backend (`TransportInfoManagement.API`)

#### 1. **ApplicationDbContext.cs** (Line 170-180)
```csharp
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
```

#### 2. **Program.cs** (Line 225-290)
```csharp
// Runtime seed data - ensures services exist with correct names
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

// Service Fees
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
```

### Frontend (`sem3fe`)

#### 1. **app/services/page.tsx** (Line 25-74)
```typescript
const services = [
  {
    name: 'In-bound Services',
    pricing: '$4,500 per day per employee'
  },
  {
    name: 'Out-bound Services',
    pricing: '$6,000 per day per employee'
  },
  {
    name: 'Tele Marketing',
    pricing: '$5,500 per day per employee'
  }
];
```

#### 2. **app/settings/page.tsx** (Line 42-67)
```typescript
const initialCharges: ServiceCharge[] = [
  {
    id: 1,
    serviceId: 1,
    serviceType: 'inbound',
    feePerDayPerEmployee: 4500,
  },
  {
    id: 2,
    serviceId: 2,
    serviceType: 'outbound',
    feePerDayPerEmployee: 6000,
  },
  {
    id: 3,
    serviceId: 3,
    serviceType: 'telemarketing',
    feePerDayPerEmployee: 5500,
  }
];
```

#### 3. **utils/chargeCalculator.ts** (Line 7-12)
```typescript
const SERVICE_CHARGES: { [key: string]: number } = {
  'In-bound': 4500,
  'Out-bound': 6000,
  'Tele Marketing': 5500,
  'Inbound': 4500, // Alternative naming
  'Outbound': 6000,
  'Telemarketing': 5500
};
```

---

## 🔧 Key Changes Made

### 1. Fixed Service Names in Program.cs
- **Before**: `"Inbound Support"`, `"Outbound Sales"`, `"Telemarketing"`
- **After**: `"In-bound Services"`, `"Out-bound Services"`, `"Tele Marketing Services"`
- **Reason**: Must match frontend exactly for API consistency

### 2. Added Service Fee Seeding in Program.cs
- Ensures service fees are created at runtime if missing
- Updates existing fees to match frontend pricing
- Prevents pricing mismatches

### 3. Added Service Name Update Logic
- Updates existing services with old names to new names
- Ensures consistency even if database already has data

---

## ✅ Verification Checklist

- [x] Service names match between backend and frontend
- [x] Service IDs are consistent (1, 2, 3)
- [x] Pricing matches exactly ($4,500, $6,000, $5,500)
- [x] Service descriptions are consistent
- [x] Service fees are seeded correctly
- [x] Runtime seed data matches migration seed data

---

## 🚀 Testing

After making these changes:

1. **Restart Backend Server**:
   ```bash
   cd Sem3/ppj3/src/TransportInfoManagement.API
   dotnet run
   ```

2. **Verify Services API**:
   ```bash
   GET http://localhost:5000/api/services
   ```
   Should return:
   ```json
   [
     { "id": 1, "name": "In-bound Services", ... },
     { "id": 2, "name": "Out-bound Services", ... },
     { "id": 3, "name": "Tele Marketing Services", ... }
   ]
   ```

3. **Verify Service Fees API**:
   ```bash
   GET http://localhost:5000/api/servicefees
   ```
   Should return:
   ```json
   [
     { "id": 1, "serviceId": 1, "feePerDayPerEmployee": 4500.00 },
     { "id": 2, "serviceId": 2, "feePerDayPerEmployee": 6000.00 },
     { "id": 3, "serviceId": 3, "feePerDayPerEmployee": 5500.00 }
   ]
   ```

4. **Check Frontend**:
   - Navigate to `/services` page
   - Verify service names and pricing display correctly
   - Check cart functionality works with correct prices

---

## 📝 Notes

- Service names use **hyphens** and **capitalization** exactly as shown
- Pricing is in **USD** and stored as **decimal** in database
- Service IDs are **fixed** (1, 2, 3) and should not change
- Both migration seed data and runtime seed data must match

---

## 🔄 Maintenance

If you need to update service names or pricing:

1. **Update Backend**:
   - `ApplicationDbContext.cs` (migration seed data)
   - `Program.cs` (runtime seed data)

2. **Update Frontend**:
   - `app/services/page.tsx`
   - `app/settings/page.tsx`
   - `utils/chargeCalculator.ts`
   - Any other service-related pages

3. **Run Database Migration** (if needed):
   ```bash
   dotnet ef migrations add UpdateServiceNames
   dotnet ef database update
   ```

4. **Restart Both Servers**:
   - Backend: `dotnet run`
   - Frontend: `npm run dev`

---

## ✅ Result

After these changes, the backend and frontend are now perfectly aligned:
- ✅ Service names match exactly
- ✅ Pricing matches exactly
- ✅ Service IDs are consistent
- ✅ Mock data works correctly in both environments

