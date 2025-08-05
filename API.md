# SecurePay API Documentation

## Overview

The SecurePay API is built on Cloudflare Workers using the Hono framework. It provides a RESTful interface for managing international payments, user profiles, and compliance features.

**Base URL**: `https://your-worker.your-subdomain.workers.dev`

## Authentication

All API endpoints require authentication via session cookies. The session is established through the `/api/login` endpoint.

### Session Management
- Sessions are managed via HTTP-only cookies
- Session tokens expire after 60 days
- All authenticated requests must include the session cookie

## Endpoints

### Authentication

#### POST `/api/login`
Establishes a user session.

**Request Body**: None (uses mock authentication)

**Response**:
```json
{
  "success": true
}
```

**Cookies Set**:
- `session_token`: HTTP-only session cookie

#### GET `/api/users/me`
Retrieves the current authenticated user's information.

**Response**:
```json
{
  "id": "1",
  "email": "user@example.com",
  "google_user_data": {
    "given_name": "John"
  },
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

#### GET `/api/logout`
Terminates the current user session.

**Response**:
```json
{
  "success": true
}
```

### User Profile

#### GET `/api/profile`
Retrieves the user's complete profile information.

**Response**:
```json
{
  "id": 1,
  "user_id": "1",
  "full_name": "John Doe",
  "id_number": "1234567890123",
  "account_number": "12345678",
  "username": "johndoe",
  "profile_picture": "https://via.placeholder.com/150",
  "phone_number": "+27123456789",
  "phone_verified": true,
  "date_of_birth": "1990-01-01",
  "gender": "male",
  "address": {
    "street_address": "123 Main Street",
    "city": "Cape Town",
    "state_province": "Western Cape",
    "postal_code": "8001",
    "country": "South Africa"
  },
  "kyc_documents": [
    {
      "type": "passport",
      "file_name": "passport.pdf",
      "file_url": "https://example.com/passport.pdf",
      "uploaded_at": "2024-01-01T00:00:00.000Z",
      "verified": true,
      "verification_date": "2024-01-01T00:00:00.000Z"
    }
  ],
  "account_verification_status": "verified",
  "notification_settings": {
    "email_notifications": true,
    "sms_notifications": false,
    "push_notifications": true,
    "transaction_alerts": true,
    "security_alerts": true,
    "marketing_emails": false,
    "weekly_reports": false
  },
  "privacy_settings": {
    "profile_visibility": "private",
    "show_online_status": false,
    "allow_data_sharing": false,
    "allow_analytics": true,
    "allow_cookies": true
  },
  "user_preferences": {
    "language": "en",
    "currency": "USD",
    "timezone": "UTC",
    "date_format": "MM/DD/YYYY",
    "theme": "light",
    "email_frequency": "immediate"
  },
  "is_verified": true,
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z",
  "last_login": "2024-01-01T00:00:00.000Z",
  "account_status": "active"
}
```

#### POST `/api/profile`
Updates the user's profile information.

**Request Body**:
```json
{
  "full_name": "John Doe",
  "id_number": "1234567890123",
  "account_number": "12345678",
  "username": "johndoe",
  "phone_number": "+27123456789",
  "date_of_birth": "1990-01-01",
  "gender": "male",
  "address": {
    "street_address": "123 Main Street",
    "city": "Cape Town",
    "state_province": "Western Cape",
    "postal_code": "8001",
    "country": "South Africa"
  },
  "notification_settings": {
    "email_notifications": true,
    "sms_notifications": false,
    "push_notifications": true,
    "transaction_alerts": true,
    "security_alerts": true,
    "marketing_emails": false,
    "weekly_reports": false
  },
  "privacy_settings": {
    "profile_visibility": "private",
    "show_online_status": false,
    "allow_data_sharing": false,
    "allow_analytics": true,
    "allow_cookies": true
  },
  "user_preferences": {
    "language": "en",
    "currency": "USD",
    "timezone": "UTC",
    "date_format": "MM/DD/YYYY",
    "theme": "light",
    "email_frequency": "immediate"
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": { /* profile data */ }
}
```

#### POST `/api/profile/delete`
Marks the user's account for deletion.

**Response**:
```json
{
  "success": true,
  "message": "Account marked for deletion"
}
```

#### POST `/api/profile/verify-phone`
Initiates phone number verification.

**Response**:
```json
{
  "success": true,
  "message": "Verification code sent"
}
```

#### POST `/api/profile/kyc-upload`
Uploads KYC documents.

**Request Body** (multipart/form-data):
- `file`: Document file (PDF, JPEG, PNG)
- `type`: Document type (passport, national_id, drivers_license, utility_bill, bank_statement)

**Response**:
```json
{
  "success": true,
  "message": "Document uploaded successfully"
}
```

### Transactions

#### GET `/api/transactions`
Retrieves the user's transaction history.

**Response**:
```json
[
  {
    "id": 1,
    "user_id": "1",
    "transaction_id": "TXN123456789",
    "amount": 1000.00,
    "currency": "USD",
    "recipient_account": "12345678",
    "swift_code": "ABCDEF12",
    "status": "Sent",
    "reference": "Payment for services",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
]
```

#### POST `/api/transactions`
Creates a new international payment.

**Request Body**:
```json
{
  "amount": 1000.00,
  "currency": "USD",
  "recipient_account": "12345678",
  "swift_code": "ABCDEF12",
  "reference": "Payment for services"
}
```

**Response**:
```json
{
  "success": true,
  "transaction_id": "TXN123456789",
  "data": { /* transaction data */ }
}
```

### Account & Analytics

#### GET `/api/account/balance`
Retrieves the user's account balance.

**Response**:
```json
{
  "available": 12500.75,
  "pending": 500.00,
  "currency": "USD",
  "last_updated": "2024-01-01T00:00:00.000Z"
}
```

#### GET `/api/transactions/analytics`
Retrieves transaction analytics data.

**Response**:
```json
{
  "total_sent": 25000,
  "total_received": 12000,
  "monthly": [
    {
      "month": "2024-01",
      "sent": 2000,
      "received": 1000
    }
  ],
  "categories": [
    {
      "category": "Rent",
      "amount": 8000
    }
  ],
  "daily": [
    {
      "date": "2024-04-01",
      "amount": 500
    }
  ]
}
```

#### GET `/api/activity`
Retrieves user activity feed.

**Response**:
```json
[
  {
    "id": "1",
    "type": "payment",
    "description": "Sent $500 to John",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
]
```

### Reports

#### GET `/api/reports/monthly`
Retrieves monthly transaction report.

**Response**:
```json
{
  "month": "2024-04",
  "total_sent": 5000,
  "total_received": 2000,
  "transactions": 12,
  "tax_paid": 150
}
```

#### GET `/api/reports/tax`
Retrieves tax report.

**Response**:
```json
{
  "year": "2024",
  "total_taxable": 24000,
  "total_tax_paid": 1800,
  "details": [
    {
      "month": "2024-01",
      "taxable": 2000,
      "tax_paid": 150
    }
  ]
}
```

#### GET `/api/reports/custom`
Retrieves custom report.

**Response**:
```json
{
  "id": "custom-1",
  "name": "My Custom Report",
  "generated_at": "2024-01-01T00:00:00.000Z",
  "data": { "note": "This is a custom report." }
}
```

#### GET `/api/audit-log`
Retrieves audit log entries.

**Response**:
```json
[
  {
    "id": "1",
    "user_id": "1",
    "action": "login",
    "details": "User logged in",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
]
```

### Notifications

#### GET `/api/notifications`
Retrieves user notifications.

**Response**:
```json
[
  {
    "id": "1",
    "user_id": "1",
    "type": "in_app",
    "title": "Payment Successful",
    "message": "Your payment of $500 has been processed successfully.",
    "priority": "medium",
    "status": "unread",
    "category": "transaction",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
]
```

#### POST `/api/notifications/:id/read`
Marks a notification as read.

**Response**:
```json
{
  "success": true
}
```

#### POST `/api/notifications/:id/archive`
Archives a notification.

**Response**:
```json
{
  "success": true
}
```

#### POST `/api/notifications/settings`
Updates notification settings.

**Request Body**:
```json
{
  "email_enabled": true,
  "sms_enabled": false,
  "push_enabled": true,
  "in_app_enabled": true,
  "transaction_notifications": true,
  "security_notifications": true,
  "marketing_notifications": false,
  "quiet_hours_enabled": false,
  "quiet_hours_start": "22:00",
  "quiet_hours_end": "08:00"
}
```

**Response**:
```json
{
  "success": true
}
```

### Support & Communication

#### GET `/api/chat/history`
Retrieves chat history.

**Response**:
```json
[
  {
    "id": "1",
    "user_id": "1",
    "type": "text",
    "content": "Hello, I need help with my account verification.",
    "created_at": "2024-01-01T00:00:00.000Z",
    "is_from_user": true
  }
]
```

#### POST `/api/chat/send`
Sends a chat message.

**Request Body**:
```json
{
  "content": "Hello, I need help",
  "type": "text"
}
```

**Response**:
```json
{
  "id": "msg-123",
  "user_id": "1",
  "type": "text",
  "content": "Hello, I need help",
  "created_at": "2024-01-01T00:00:00.000Z",
  "is_from_user": true
}
```

#### GET `/api/support/tickets`
Retrieves support tickets.

**Response**:
```json
[
  {
    "id": "TICKET-001",
    "user_id": "1",
    "subject": "Account Verification Issue",
    "description": "I'm having trouble uploading my ID documents.",
    "status": "open",
    "priority": "high",
    "category": "account",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z",
    "messages": [
      {
        "id": "msg-1",
        "user_id": "1",
        "type": "text",
        "content": "I'm having trouble uploading my ID documents.",
        "created_at": "2024-01-01T00:00:00.000Z",
        "is_from_user": true
      }
    ]
  }
]
```

#### POST `/api/support/tickets`
Creates a new support ticket.

**Request Body**:
```json
{
  "subject": "Account Verification Issue",
  "description": "I'm having trouble uploading my ID documents.",
  "category": "account",
  "priority": "high"
}
```

**Response**:
```json
{
  "id": "TICKET-001",
  "user_id": "1",
  "subject": "Account Verification Issue",
  "description": "I'm having trouble uploading my ID documents.",
  "status": "open",
  "priority": "high",
  "category": "account",
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z",
  "messages": [
    {
      "id": "msg-1",
      "user_id": "1",
      "type": "text",
      "content": "I'm having trouble uploading my ID documents.",
      "created_at": "2024-01-01T00:00:00.000Z",
      "is_from_user": true
    }
  ]
}
```

#### POST `/api/support/tickets/:id/messages`
Adds a message to a support ticket.

**Request Body**:
```json
{
  "content": "Can you help me with this issue?"
}
```

**Response**:
```json
{
  "id": "msg-123",
  "user_id": "1",
  "type": "text",
  "content": "Can you help me with this issue?",
  "created_at": "2024-01-01T00:00:00.000Z",
  "is_from_user": true
}
```

#### GET `/api/faq`
Retrieves FAQ entries.

**Response**:
```json
[
  {
    "id": "1",
    "category": "account",
    "question": "How do I verify my account?",
    "answer": "To verify your account, please upload a valid government-issued ID and proof of address.",
    "tags": ["verification", "kyc", "account"],
    "helpful_count": 45,
    "not_helpful_count": 2,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
]
```

#### POST `/api/faq/:id/vote`
Votes on FAQ helpfulness.

**Request Body**:
```json
{
  "helpful": true
}
```

**Response**:
```json
{
  "success": true
}
```

### Compliance & Legal

#### POST `/api/verification/identity`
Submits identity verification.

**Request Body**:
```json
{
  "document_type": "passport",
  "document_number": "123456789",
  "document_front_url": "https://example.com/passport-front.jpg",
  "selfie_url": "https://example.com/selfie.jpg"
}
```

**Response**:
```json
{
  "id": "verification-123",
  "user_id": "1",
  "document_type": "passport",
  "document_number": "123456789",
  "document_front_url": "https://example.com/passport-front.jpg",
  "selfie_url": "https://example.com/selfie.jpg",
  "status": "pending",
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

#### GET `/api/verification/status`
Retrieves verification status.

**Response**:
```json
{
  "id": "verification-001",
  "user_id": "1",
  "document_type": "passport",
  "document_number": "123456789",
  "document_front_url": "https://example.com/passport-front.jpg",
  "selfie_url": "https://example.com/selfie.jpg",
  "status": "pending",
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

#### GET `/api/risk/assessment`
Retrieves risk assessment.

**Response**:
```json
{
  "id": "risk-001",
  "user_id": "1",
  "risk_score": 25,
  "risk_level": "low",
  "factors": ["Verified account", "Regular transaction patterns"],
  "assessment_date": "2024-01-01T00:00:00.000Z",
  "next_review_date": "2024-02-01T00:00:00.000Z"
}
```

#### GET `/api/compliance/reports`
Retrieves compliance reports.

**Response**:
```json
[
  {
    "id": "report-001",
    "report_type": "kyc",
    "period_start": "2024-01-01",
    "period_end": "2024-01-31",
    "data": {
      "total_verifications": 150,
      "approved": 142,
      "rejected": 8,
      "pending": 0
    },
    "generated_at": "2024-01-01T00:00:00.000Z",
    "status": "completed"
  }
]
```

#### POST `/api/legal/terms/accept`
Accepts terms of service.

**Request Body**:
```json
{
  "version": "1.0"
}
```

**Response**:
```json
{
  "id": "acceptance-123",
  "user_id": "1",
  "terms_version": "1.0",
  "accepted_at": "2024-01-01T00:00:00.000Z",
  "ip_address": "192.168.1.1",
  "user_agent": "Mozilla/5.0..."
}
```

#### GET `/api/legal/terms/status`
Retrieves terms acceptance status.

**Response**:
```json
{
  "id": "acceptance-001",
  "user_id": "1",
  "terms_version": "1.0",
  "accepted_at": "2024-01-01T00:00:00.000Z",
  "ip_address": "192.168.1.1",
  "user_agent": "Mozilla/5.0..."
}
```

#### POST `/api/legal/privacy/consent`
Updates privacy consent.

**Request Body**:
```json
{
  "type": "marketing",
  "granted": true
}
```

**Response**:
```json
{
  "id": "consent-123",
  "user_id": "1",
  "consent_type": "marketing",
  "granted": true,
  "granted_at": "2024-01-01T00:00:00.000Z",
  "ip_address": "192.168.1.1",
  "user_agent": "Mozilla/5.0..."
}
```

#### GET `/api/legal/privacy/consents`
Retrieves privacy consents.

**Response**:
```json
[
  {
    "id": "consent-001",
    "user_id": "1",
    "consent_type": "essential",
    "granted": true,
    "granted_at": "2024-01-01T00:00:00.000Z",
    "ip_address": "192.168.1.1",
    "user_agent": "Mozilla/5.0..."
  }
]
```

#### POST `/api/data/export`
Requests data export.

**Request Body**:
```json
{
  "type": "all"
}
```

**Response**:
```json
{
  "id": "export-123",
  "user_id": "1",
  "export_type": "all",
  "status": "pending",
  "requested_at": "2024-01-01T00:00:00.000Z",
  "expires_at": "2024-01-08T00:00:00.000Z"
}
```

#### GET `/api/data/export/:id`
Retrieves data export status.

**Response**:
```json
{
  "id": "export-123",
  "user_id": "1",
  "export_type": "all",
  "status": "completed",
  "file_url": "https://example.com/exports/user-data-2024-01-01.zip",
  "requested_at": "2024-01-01T00:00:00.000Z",
  "completed_at": "2024-01-01T00:00:00.000Z",
  "expires_at": "2024-01-08T00:00:00.000Z"
}
```

## Error Handling

All API endpoints return appropriate HTTP status codes and error messages.

### Common Error Responses

#### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```

#### 400 Bad Request
```json
{
  "error": "Validation failed",
  "details": {
    "field": "error message"
  }
}
```

#### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

## Rate Limiting

API endpoints are subject to rate limiting to prevent abuse. Limits are configurable per endpoint.

## Security

- All endpoints require authentication (except public endpoints)
- HTTPS is required for all requests
- Input validation is performed on all requests
- CORS is configured for security
- Session tokens are HTTP-only cookies

## SDKs and Libraries

Official SDKs are available for:
- JavaScript/TypeScript
- Python
- Java
- PHP

## Support

For API support:
- **Documentation**: [api.securepay.com](https://api.securepay.com)
- **Support**: [support.securepay.com](https://support.securepay.com)
- **Email**: api-support@securepay.com 