# E-Commerce Baby Clothing Store - Architecture Overview

## Overview

This is a full-stack e-commerce web application specifically designed for baby clothing retail. The application provides distinct experiences for customers and administrators, featuring a modern React frontend with Express backend, PostgreSQL database with Drizzle ORM, and email/password authentication.

**Recent Changes (July 20, 2025):**
- Successfully migrated project from Replit Agent to standard Replit environment
- Set up PostgreSQL database with complete schema migration using Drizzle
- All dependencies installed and configured for Replit compatibility
- Project now runs cleanly with proper database connectivity
- Updated hero section background color to custom green (#142e15) as requested
- Previously migrated from Replit OAuth to traditional email/password authentication
- Implemented bcrypt password hashing with session-based authentication
- Updated database schema with integer user IDs and password fields
- Built comprehensive login and signup pages with form validation
- Updated all API routes to use session authentication instead of OAuth tokens
- Added admin request system allowing users to request admin access from their profile
- Created sample categories and products for testing the admin functionality
- Fixed admin dashboard publishing functionality with proper form validation
- Changed Available Colors and Sizes to dropdown selectors with badge display
- Removed Learn More button from landing page per user preference
- Added reference images field to product schema for customization options
- Fixed API fetch errors in product creation/update with proper HTTP methods

The application is built as a multi-page application with dedicated pages for shopping, product management, cart functionality, user profiles, and administrative controls.

## User Preferences

Preferred communication style: Simple, everyday language.
UI Preferences: Learn more and logout buttons should have black text by default, with green hover states for better visibility.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **UI Framework**: Shadcn/ui components with Radix UI primitives
- **Styling**: TailwindCSS with custom color scheme (baby-primary, baby-secondary, baby-accent, baby-green)
- **State Management**: TanStack React Query for server state, React hooks for local state
- **Build Tool**: Vite with hot module replacement for development

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with organized route structure
- **Database Access**: Drizzle ORM with connection pooling
- **Session Management**: Express sessions with PostgreSQL storage

### Authentication System
- **Provider**: Traditional email/password authentication with bcrypt hashing
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **Authorization**: Role-based access control (customer/admin roles)
- **Security**: HTTP-only cookies, secure session configuration, salted password hashing
- **Admin Access**: Users can request admin access through their profile page (automatically granted for demo purposes)

## Key Components

### Database Schema (PostgreSQL + Drizzle)
- **Users**: Authentication data, roles (customer/admin), profile information
- **Categories**: Product categorization system
- **Products**: Product catalog with images, pricing, inventory, sizes, colors
- **Carts & Cart Items**: Shopping cart functionality with user association
- **Orders & Order Items**: Complete order management system
- **Wishlists**: Customer wishlist functionality
- **Reviews**: Product review system with user associations
- **Sessions**: Secure session storage for authentication

### Frontend Pages Structure
- **Landing Page**: Unauthenticated welcome page with sign-in prompt
- **Home Page**: Dashboard with featured products and category navigation
- **Shop Page**: Product catalog with filtering, search, and pagination
- **Product Detail**: Individual product pages with reviews and purchasing options
- **Cart Page**: Shopping cart management with quantity updates
- **Checkout Page**: Multi-step checkout process with address and payment forms
- **Profile Page**: User account management and order history
- **Admin Dashboard**: Administrative interface for product and order management

### UI Component System
- **Design System**: Consistent baby-themed color palette and typography
- **Component Library**: Reusable components built on Radix UI primitives
- **Responsive Design**: Mobile-first approach with breakpoint-aware layouts
- **Accessibility**: ARIA-compliant components with keyboard navigation

## Data Flow

### Authentication Flow
1. Unauthenticated users see landing page with Replit OAuth login
2. OAuth redirect to Replit identity provider
3. Successful authentication creates/updates user record
4. Session established with PostgreSQL storage
5. Frontend receives user data and role information

### Shopping Flow
1. Browse products on home page or shop page with filters
2. View detailed product information and reviews
3. Add items to cart with size/color selection
4. Proceed through checkout with shipping/billing forms
5. Order confirmation and inventory updates

### Admin Flow
1. Admin users access dedicated dashboard
2. Manage product catalog (CRUD operations)
3. View and process customer orders
4. Monitor sales statistics and analytics

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React, React DOM, React Query for state management
- **UI Libraries**: Radix UI components, Lucide React icons
- **Styling**: TailwindCSS, PostCSS, class-variance-authority
- **Forms**: React Hook Form with Zod validation
- **Routing**: Wouter for lightweight routing

### Backend Dependencies
- **Database**: Neon serverless PostgreSQL, Drizzle ORM
- **Authentication**: OpenID Client, Passport.js strategies
- **Session Management**: Express session with PostgreSQL store
- **Development**: tsx for TypeScript execution, esbuild for production builds

### Development Tools
- **Build System**: Vite with React plugin and Replit integrations
- **Type Safety**: TypeScript with strict configuration
- **Database Migrations**: Drizzle Kit for schema management

## Deployment Strategy

### Production Build Process
1. **Frontend**: Vite builds optimized React bundle to `dist/public`
2. **Backend**: esbuild compiles TypeScript server to `dist/index.js`
3. **Database**: Drizzle migrations ensure schema consistency
4. **Assets**: Static files served through Express in production

### Environment Configuration
- **Development**: tsx with hot reload, Vite dev server, separate client/server processes
- **Production**: Single Node.js process serving both API and static files
- **Database**: Environment variable configuration for connection strings

### Deployment Requirements
- Node.js runtime environment
- PostgreSQL database (Neon serverless recommended)
- Environment variables for database URL and session secrets
- HTTPS configuration for secure authentication cookies

The architecture emphasizes type safety, modern development practices, and scalable patterns while maintaining simplicity for future development and maintenance.