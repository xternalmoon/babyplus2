# Admin Permissions Guide

## How to Give Admin Access to Users

### Method 1: Manual Database Update (Recommended)
1. Open the SQL tool or database console
2. Run this command to make a user admin:
```sql
UPDATE users SET role = 'admin' WHERE email = 'user@example.com';
```

### Method 2: Using the User Request System
1. User goes to their Profile page
2. User clicks "Request Admin Access" button in the Account tab
3. For demo purposes, this automatically grants admin access
4. In production, this would create a request for manual review

### View Current User Roles
```sql
SELECT id, email, first_name, last_name, role, created_at 
FROM users 
ORDER BY created_at DESC;
```

### Remove Admin Access
```sql
UPDATE users SET role = 'customer' WHERE email = 'user@example.com';
```

## Admin Features

### What Admins Can Do:
- Access Admin Dashboard (`/admin` route)
- View sales statistics and analytics
- Manage product catalog (create, edit, delete)
- View and manage customer orders
- Set order status (pending, processing, shipped, delivered, cancelled)

### Admin Dashboard Features:
- **Dashboard Stats**: Revenue, orders, products, customers count
- **Product Management**: Full CRUD operations with customization options
- **Order Management**: View all orders and update statuses
- **Analytics**: Sales trends and performance metrics

## Product Publishing Features

### New Product Creation Form Includes:
- Basic info: Name, description, price, stock
- Customization: Colors (comma-separated), sizes (comma-separated)
- Images: Main product image URL, reference images
- Settings: Active status, featured product flag
- Organization: SKU code, age group, category

### Product Customization Options:
- **Colors**: White, Pink, Blue, Yellow, etc.
- **Sizes**: 0-3M, 3-6M, 6-9M, 9-12M, etc.
- **Reference Images**: Multiple inspiration/reference images
- **Age Groups**: 0-6M, 6-12M, 12-24M

The publishing system now includes proper form validation and error handling.