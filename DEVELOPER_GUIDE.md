# SecurePay Developer Guide

This guide is for developers contributing to the SecurePay platform. It covers the development environment setup, architecture, coding standards, and contribution guidelines.

## 🛠️ Development Environment

### Prerequisites

- **Node.js**: Version 18 or higher
- **npm**: Version 8 or higher
- **Git**: Latest version
- **Cloudflare Account**: For deployment and testing
- **Code Editor**: VS Code recommended with extensions

### Required VS Code Extensions

```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense"
  ]
}
```

### Initial Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-org/securepay-app.git
   cd securepay-app
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

## 🏗️ Architecture Overview

### Frontend Architecture

```
src/
├── components/          # Reusable UI components
│   ├── Layout.tsx      # Main layout wrapper
│   ├── Dialog.tsx      # Modal dialogs
│   ├── FormField.tsx   # Form input components
│   ├── LoadingSpinner.tsx # Loading indicators
│   └── ErrorBoundary.tsx # Error handling
├── contexts/           # React contexts
│   ├── AuthContext.tsx # Authentication state
│   └── ThemeContext.tsx # Theme management
├── pages/              # Page components
│   ├── Dashboard.tsx   # Main dashboard
│   ├── Profile.tsx     # User profile
│   ├── PaymentForm.tsx # Payment processing
│   ├── Login.tsx       # Authentication
│   └── Register.tsx    # User registration
├── shared/             # Shared utilities
│   └── types.ts        # TypeScript definitions
├── worker/             # Cloudflare Workers backend
│   └── index.ts        # API endpoints
├── i18n.ts             # Internationalization
├── main.tsx            # Application entry point
└── App.tsx             # Root component
```

### Backend Architecture

```
worker/
├── index.ts            # Main API router
├── middleware/         # Custom middleware
├── validators/         # Request validation
├── services/           # Business logic
└── types/              # Backend types
```

## 📝 Coding Standards

### TypeScript Guidelines

#### Type Definitions
```typescript
// Use interfaces for object shapes
interface UserProfile {
  id: string;
  email: string;
  fullName: string;
}

// Use types for unions and complex types
type PaymentStatus = 'pending' | 'completed' | 'failed';

// Use enums sparingly, prefer const assertions
const PAYMENT_STATUSES = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed'
} as const;
```

#### Component Structure
```typescript
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type { UserProfile } from '@/shared/types';

interface ProfileProps {
  userId: string;
  onUpdate?: (profile: UserProfile) => void;
}

export default function Profile({ userId, onUpdate }: ProfileProps) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      const response = await fetch(`/api/profile/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="profile-container">
      {/* Component content */}
    </div>
  );
}
```

### React Best Practices

#### Hooks Usage
```typescript
// ✅ Good: Use useCallback for expensive operations
const handleSubmit = useCallback(async (data: FormData) => {
  // Expensive operation
}, [dependencies]);

// ✅ Good: Use useMemo for expensive calculations
const expensiveValue = useMemo(() => {
  return heavyCalculation(data);
}, [data]);

// ✅ Good: Custom hooks for reusable logic
function useProfile(userId: string) {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch logic
  }, [userId]);

  return { profile, isLoading };
}
```

#### Error Handling
```typescript
// ✅ Good: Error boundaries for component errors
export default function ErrorBoundary({ children }: { children: ReactNode }) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return <ErrorFallback onRetry={() => setHasError(false)} />;
  }

  return children;
}

// ✅ Good: Try-catch in async operations
const handlePayment = async (paymentData: PaymentData) => {
  try {
    setIsLoading(true);
    const response = await fetch('/api/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentData),
    });

    if (!response.ok) {
      throw new Error('Payment failed');
    }

    const result = await response.json();
    setPaymentResult(result);
  } catch (error) {
    setError(error instanceof Error ? error.message : 'Unknown error');
  } finally {
    setIsLoading(false);
  }
};
```

### Styling Guidelines

#### Tailwind CSS Usage
```typescript
// ✅ Good: Use Tailwind utility classes
<div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
  <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
    Payment Details
  </h2>
  <p className="text-slate-600 dark:text-slate-400">
    Review your payment information
  </p>
</div>

// ✅ Good: Responsive design
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Responsive grid */}
</div>

// ✅ Good: Dark mode support
<div className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
  {/* Dark mode compatible */}
</div>
```

#### Component Styling
```typescript
// ✅ Good: Consistent spacing and sizing
const buttonVariants = {
  primary: "bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg",
  secondary: "bg-slate-200 hover:bg-slate-300 text-slate-900 px-4 py-2 rounded-lg",
  danger: "bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
};

// ✅ Good: Reusable component classes
const cardClasses = "bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6";
const inputClasses = "w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500";
```

## 🔧 Development Workflow

### Git Workflow

#### Branch Naming
```bash
# Feature branches
feature/user-profile-management
feature/payment-processing
feature/notification-system

# Bug fixes
fix/login-authentication
fix/payment-validation
fix/memory-leak

# Hotfixes
hotfix/security-vulnerability
hotfix/critical-bug
```

#### Commit Messages
```bash
# Format: type(scope): description
feat(auth): add Google OAuth integration
fix(profile): resolve memory leak in file upload
docs(api): update API documentation
style(ui): improve button styling
refactor(payment): simplify payment validation
test(auth): add authentication tests
```

#### Pull Request Process
1. **Create Feature Branch**
   ```bash
   git checkout -b feature/new-feature
   ```

2. **Make Changes**
   - Write code following standards
   - Add tests for new features
   - Update documentation

3. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat(component): add new feature"
   ```

4. **Push and Create PR**
   ```bash
   git push origin feature/new-feature
   # Create PR on GitHub
   ```

5. **Code Review**
   - Address review comments
   - Ensure all checks pass
   - Get approval from maintainers

6. **Merge**
   - Squash commits if needed
   - Merge to main branch
   - Delete feature branch

### Testing Strategy

#### Unit Tests
```typescript
// Example test for a component
import { render, screen, fireEvent } from '@testing-library/react';
import { PaymentForm } from './PaymentForm';

describe('PaymentForm', () => {
  it('should validate payment amount', () => {
    render(<PaymentForm />);
    
    const amountInput = screen.getByLabelText('Amount');
    fireEvent.change(amountInput, { target: { value: '-100' } });
    
    expect(screen.getByText('Amount must be positive')).toBeInTheDocument();
  });

  it('should submit valid payment', async () => {
    const mockSubmit = jest.fn();
    render(<PaymentForm onSubmit={mockSubmit} />);
    
    // Fill form with valid data
    fireEvent.change(screen.getByLabelText('Amount'), { target: { value: '100' } });
    fireEvent.click(screen.getByText('Submit'));
    
    expect(mockSubmit).toHaveBeenCalledWith({
      amount: 100,
      currency: 'USD'
    });
  });
});
```

#### Integration Tests
```typescript
// Example API integration test
describe('Payment API', () => {
  it('should create payment successfully', async () => {
    const paymentData = {
      amount: 100,
      currency: 'USD',
      recipientAccount: '12345678',
      swiftCode: 'ABCDEF12'
    };

    const response = await fetch('/api/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentData)
    });

    expect(response.status).toBe(200);
    const result = await response.json();
    expect(result.transactionId).toBeDefined();
  });
});
```

### Code Quality

#### ESLint Configuration
```javascript
// .eslintrc.js
module.exports = {
  extends: [
    '@typescript-eslint/recommended',
    'plugin:react-hooks/recommended'
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn'
  }
};
```

#### Prettier Configuration
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

## 🚀 Deployment

### Development Deployment

```bash
# Build for development
npm run build:dev

# Deploy to development environment
npm run deploy:dev
```

### Production Deployment

```bash
# Build for production
npm run build

# Deploy to production
npm run deploy:prod
```

### Environment Configuration

```bash
# Development
VITE_API_URL=http://localhost:8787
VITE_ENVIRONMENT=development

# Staging
VITE_API_URL=https://staging-api.securepay.com
VITE_ENVIRONMENT=staging

# Production
VITE_API_URL=https://api.securepay.com
VITE_ENVIRONMENT=production
```

## 🔍 Debugging

### Frontend Debugging

#### React DevTools
- Install React DevTools browser extension
- Use Components tab to inspect component tree
- Use Profiler tab to analyze performance

#### Console Debugging
```typescript
// ✅ Good: Structured logging
console.group('Payment Processing');
console.log('Payment data:', paymentData);
console.log('Validation result:', validationResult);
console.groupEnd();

// ✅ Good: Error logging
console.error('Payment failed:', {
  error: error.message,
  paymentId: payment.id,
  timestamp: new Date().toISOString()
});
```

#### Network Debugging
- Use browser DevTools Network tab
- Monitor API requests and responses
- Check for failed requests and errors

### Backend Debugging

#### Cloudflare Workers Debugging
```typescript
// ✅ Good: Structured logging
console.log('API Request:', {
  method: request.method,
  url: request.url,
  headers: Object.fromEntries(request.headers)
});

// ✅ Good: Error handling
try {
  const result = await processPayment(paymentData);
  console.log('Payment processed:', result);
} catch (error) {
  console.error('Payment processing failed:', {
    error: error.message,
    stack: error.stack,
    paymentData
  });
  throw error;
}
```

#### Wrangler CLI Debugging
```bash
# Local development with debugging
wrangler dev --local --debug

# View logs
wrangler tail

# Test specific function
wrangler dev --test-scheduled
```

## 📚 Documentation

### Code Documentation

#### JSDoc Comments
```typescript
/**
 * Processes a payment transaction
 * @param paymentData - The payment information
 * @param options - Processing options
 * @returns Promise resolving to payment result
 * @throws {PaymentError} When payment processing fails
 */
async function processPayment(
  paymentData: PaymentData,
  options: PaymentOptions = {}
): Promise<PaymentResult> {
  // Implementation
}
```

#### Component Documentation
```typescript
/**
 * Payment form component for creating international transfers
 * 
 * @example
 * ```tsx
 * <PaymentForm
 *   onSubmit={handlePayment}
 *   currencies={['USD', 'EUR']}
 *   maxAmount={10000}
 * />
 * ```
 */
interface PaymentFormProps {
  /** Callback when payment is submitted */
  onSubmit: (payment: PaymentData) => void;
  /** Available currencies */
  currencies: string[];
  /** Maximum payment amount */
  maxAmount?: number;
}
```

### API Documentation

#### OpenAPI/Swagger
```yaml
openapi: 3.0.0
info:
  title: SecurePay API
  version: 1.0.0
  description: International payments platform API

paths:
  /api/payments:
    post:
      summary: Create a new payment
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/PaymentRequest'
      responses:
        '200':
          description: Payment created successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/PaymentResponse'
```

## 🔒 Security Guidelines

### Input Validation

```typescript
// ✅ Good: Server-side validation
import { z } from 'zod';

const PaymentSchema = z.object({
  amount: z.number().positive().max(50000),
  currency: z.enum(['USD', 'EUR', 'ZAR']),
  recipientAccount: z.string().regex(/^[0-9]{8,12}$/),
  swiftCode: z.string().regex(/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/)
});

// ✅ Good: Client-side validation
const validatePayment = (data: unknown) => {
  try {
    return PaymentSchema.parse(data);
  } catch (error) {
    throw new ValidationError('Invalid payment data');
  }
};
```

### Authentication

```typescript
// ✅ Good: Secure session handling
const authMiddleware = async (c: Context, next: Next) => {
  const sessionToken = getCookie(c, 'session_token');
  
  if (!sessionToken) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const user = await validateSession(sessionToken);
    c.set('user', user);
    await next();
  } catch (error) {
    return c.json({ error: 'Invalid session' }, 401);
  }
};
```

### Data Protection

```typescript
// ✅ Good: Sensitive data handling
const maskAccountNumber = (accountNumber: string): string => {
  if (accountNumber.length <= 4) return accountNumber;
  return `****${accountNumber.slice(-4)}`;
};

// ✅ Good: Secure headers
app.use('*', async (c, next) => {
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('X-Frame-Options', 'DENY');
  c.header('X-XSS-Protection', '1; mode=block');
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  await next();
});
```

## 🧪 Testing Guidelines

### Test Structure

```
tests/
├── unit/               # Unit tests
│   ├── components/     # Component tests
│   ├── utils/          # Utility function tests
│   └── hooks/          # Custom hook tests
├── integration/        # Integration tests
│   ├── api/            # API endpoint tests
│   └── workflows/      # User workflow tests
└── e2e/               # End-to-end tests
    ├── auth/           # Authentication flows
    ├── payments/       # Payment flows
    └── profile/        # Profile management flows
```

### Testing Best Practices

```typescript
// ✅ Good: Test organization
describe('PaymentForm', () => {
  describe('validation', () => {
    it('should validate amount is positive', () => {
      // Test implementation
    });

    it('should validate SWIFT code format', () => {
      // Test implementation
    });
  });

  describe('submission', () => {
    it('should submit valid payment', async () => {
      // Test implementation
    });

    it('should handle submission errors', async () => {
      // Test implementation
    });
  });
});

// ✅ Good: Test utilities
const renderWithProviders = (component: ReactElement) => {
  return render(
    <AuthProvider>
      <ThemeProvider>
        {component}
      </ThemeProvider>
    </AuthProvider>
  );
};

// ✅ Good: Mock setup
const mockApi = {
  createPayment: jest.fn(),
  getProfile: jest.fn(),
  updateProfile: jest.fn()
};

beforeEach(() => {
  jest.clearAllMocks();
});
```

## 📦 Package Management

### Dependencies

#### Production Dependencies
```json
{
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router": "^7.5.3",
    "hono": "^4.7.7",
    "zod": "^3.24.3",
    "i18next": "^25.3.2",
    "react-i18next": "^15.6.1"
  }
}
```

#### Development Dependencies
```json
{
  "devDependencies": {
    "@types/react": "^19.0.10",
    "@types/react-dom": "^19.0.4",
    "@vitejs/plugin-react": "^4.4.1",
    "typescript": "^5.8.3",
    "vite": "^6.3.2",
    "tailwindcss": "^3.4.17",
    "eslint": "^9.25.1"
  }
}
```

### Version Management

```bash
# Check for outdated packages
npm outdated

# Update packages
npm update

# Update specific package
npm install package-name@latest

# Audit for security vulnerabilities
npm audit

# Fix security vulnerabilities
npm audit fix
```

## 🚨 Common Issues

### Build Issues

#### TypeScript Errors
```bash
# Check TypeScript errors
npm run type-check

# Fix common issues
npm run lint:fix
```

#### Memory Issues
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear build cache
npm run clean
npm run build
```

### Runtime Issues

#### CORS Errors
```typescript
// Ensure CORS is properly configured
app.use('*', cors({
  origin: ['http://localhost:5173', 'https://securepay.com'],
  credentials: true
}));
```

#### Authentication Issues
```typescript
// Check session token
const sessionToken = getCookie(c, 'session_token');
if (!sessionToken) {
  return c.json({ error: 'No session token' }, 401);
}
```

## 📞 Support

### Getting Help

- **Documentation**: [docs.securepay.com](https://docs.securepay.com)
- **API Reference**: [api.securepay.com](https://api.securepay.com)
- **GitHub Issues**: [github.com/securepay/issues](https://github.com/securepay/issues)
- **Developer Chat**: [discord.gg/securepay](https://discord.gg/securepay)

### Code Reviews

- **Review Guidelines**: [CONTRIBUTING.md](CONTRIBUTING.md)
- **Review Checklist**: [REVIEW_CHECKLIST.md](REVIEW_CHECKLIST.md)
- **Review Process**: [REVIEW_PROCESS.md](REVIEW_PROCESS.md)

---

**Happy coding! 🚀** 