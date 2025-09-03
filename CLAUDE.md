# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NutriForge Pro is an enterprise-grade nutrition analysis platform built with React, TypeScript, and clean architecture principles. The application provides comprehensive nutrition calculations, body composition analysis, and professional reporting capabilities with HIPAA and GDPR compliance.

## Development Commands

### Core Development
```bash
npm start         # Start development server (port 3000)
npm run build     # Create production build
npm test          # Run tests in watch mode
npm run test:coverage  # Run tests with coverage report
```

### Code Quality
```bash
npm run lint      # Check for linting errors
npm run lint:fix  # Fix linting errors automatically
npm run format    # Format code with Prettier
npm run type-check  # Run TypeScript type checking
```

### Single Test Execution
```bash
npm test -- --testNamePattern="test name"  # Run specific test by name
npm test path/to/file.test.tsx            # Run specific test file
```

## Architecture

### Clean Architecture Layers
1. **Presentation Layer** (`src/components/`) - React components and UI
2. **Application Layer** (`src/services/`) - Business services and workflows
3. **Domain Layer** (`src/hooks/`, `src/types/`) - Business logic and entities
4. **Infrastructure Layer** (`src/services/*Service.ts`) - External integrations

### Enterprise Service Pattern
The application uses a service-oriented architecture with 15+ enterprise services:
- Each service is a singleton instance with specific responsibilities
- Services communicate through an event bus (`EventBus.ts`)
- All services implement logging, monitoring, and error handling

### Key Service Categories
- **Security**: `EnterpriseSecurityService`, `InputSanitizationService`
- **Performance**: `EnterpriseCacheService`, `EnterprisePerformanceMonitor`
- **Compliance**: `EnterpriseAuditService`, `EnterpriseComplianceService`
- **Integration**: `EnterpriseAPIService`, `EnterpriseIntegrationService`

## Code Conventions

### TypeScript Configuration
- Strict mode enabled
- Path aliases configured (`@/components`, `@/services`, etc.)
- Target ES5 with ES6 libraries

### Code Style
- No semicolons (enforced by Prettier)
- Single quotes for strings
- 2-space indentation
- Arrow functions without parentheses for single parameters

### Component Pattern
```typescript
// Components use styled-components for styling
// Props interfaces are defined inline or in types/
// Hooks are extracted to src/hooks/
// Business logic is delegated to services
```

### Service Pattern
```typescript
// Services are singleton classes
// All services extend base service classes
// Services use dependency injection pattern
// Error handling and logging are mandatory
```

## Testing Strategy
- Jest with React Testing Library
- Coverage thresholds: 80% for all metrics
- Test files co-located with source files (`*.test.tsx`)
- Service tests in `src/tests/services/`

## Performance Considerations
- Component memoization with React.memo and useMemo
- Virtual scrolling for large data sets
- Service-level caching with TTL
- Lazy loading for enterprise features
- Bundle size target: < 500KB gzipped

## Security Requirements
- All user inputs must be sanitized (`InputSanitizationService`)
- XSS protection through CSP headers
- Data validation before processing (`ValidationService`)
- Audit logging for sensitive operations

## State Management
- Local state with React hooks
- Persistent state with `useLocalStorage` hook
- Form state with `useFormPersistence` hook
- Global configuration via `EnterpriseConfigService`

## Environment Configuration
- Copy `.env.example` to `.env.local` for local development
- Required environment variables:
  - `REACT_APP_API_URL` - Backend API endpoint
  - `REACT_APP_ANALYTICS_ID` - Analytics tracking ID
  - `REACT_APP_SENTRY_DSN` - Error tracking DSN
  - `REACT_APP_VERSION` - Application version

## Build and Deployment
- Production builds go to `build/` directory
- Docker configuration available (`Dockerfile`)
- Nginx configuration for serving (`nginx.conf`)
- Multi-environment deployment strategy supported

## Common Development Tasks

### Adding a New Service
1. Create service file in `src/services/`
2. Extend appropriate base class
3. Register with service registry if needed
4. Add tests in `src/tests/services/`

### Adding a New Component
1. Create component in `src/components/ui/`
2. Use styled-components for styling
3. Extract complex logic to custom hooks
4. Add prop validation with TypeScript

### Implementing New Features
1. Start with type definitions in `src/types/`
2. Create service layer for business logic
3. Build UI components
4. Add comprehensive tests
5. Update audit logging if handling sensitive data