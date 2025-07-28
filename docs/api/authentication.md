# API Documentation

## Overview

The AuditoryX Open Network API provides programmatic access to platform features for developers building integrations and applications.

## Base URL

```
Production: https://api.auditoryx.com/v1
Staging: https://staging-api.auditoryx.com/v1
```

## Authentication

### API Keys
All API requests require authentication using API keys:

```http
Authorization: Bearer YOUR_API_KEY
```

### OAuth 2.0
For user-acting applications, use OAuth 2.0:

```http
Authorization: Bearer OAUTH_ACCESS_TOKEN
```

## Rate Limiting

- **Standard**: 1000 requests per hour
- **Premium**: 5000 requests per hour
- **Enterprise**: Custom limits

Rate limit headers included in responses:
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

## Common Headers

```http
Content-Type: application/json
Accept: application/json
Authorization: Bearer YOUR_API_KEY
X-API-Version: 2024-01-01
```

## Error Handling

### Error Format
```json
{
  "error": {
    "code": "validation_error",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "reason": "Invalid email format"
    }
  }
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Rate Limited
- `500` - Internal Server Error

## User Management

### Get User Profile
```http
GET /users/{user_id}
```

**Response:**
```json
{
  "id": "user_123",
  "email": "user@example.com",
  "displayName": "John Doe",
  "role": "creator",
  "tier": "verified",
  "verificationStatus": "verified",
  "createdAt": "2024-01-01T00:00:00Z",
  "profile": {
    "bio": "Professional audio engineer",
    "skills": ["audio editing", "mixing"],
    "location": "New York, NY"
  }
}
```

### Update User Profile
```http
PUT /users/{user_id}
```

**Request:**
```json
{
  "displayName": "John Smith",
  "profile": {
    "bio": "Updated bio",
    "skills": ["audio editing", "mixing", "mastering"]
  }
}
```

### Create User
```http
POST /users
```

**Request:**
```json
{
  "email": "newuser@example.com",
  "displayName": "New User",
  "role": "client",
  "password": "securepassword"
}
```

## Service Management

### List Services
```http
GET /services
```

**Query Parameters:**
- `category` - Filter by service category
- `min_price` - Minimum price filter
- `max_price` - Maximum price filter
- `location` - Geographic filter
- `page` - Page number (default: 1)
- `limit` - Results per page (default: 20, max: 100)

**Response:**
```json
{
  "services": [
    {
      "id": "service_456",
      "title": "Professional Audio Mixing",
      "description": "High-quality audio mixing services",
      "price": 150.00,
      "currency": "USD",
      "category": "audio",
      "creator": {
        "id": "user_123",
        "displayName": "John Doe",
        "tier": "verified"
      },
      "deliveryTime": "3-5 days",
      "rating": 4.8,
      "reviewCount": 42
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

### Get Service Details
```http
GET /services/{service_id}
```

### Create Service
```http
POST /services
```

**Request:**
```json
{
  "title": "Audio Editing Service",
  "description": "Professional audio editing and enhancement",
  "price": 100.00,
  "currency": "USD",
  "category": "audio",
  "deliveryTime": "2-3 days",
  "requirements": [
    "Raw audio files",
    "Specific editing instructions"
  ]
}
```

## Booking Management

### Create Booking
```http
POST /bookings
```

**Request:**
```json
{
  "serviceId": "service_456",
  "clientId": "user_789",
  "scheduledTime": "2024-01-15T10:00:00Z",
  "requirements": "Please enhance audio quality",
  "attachments": ["file_id_1", "file_id_2"]
}
```

**Response:**
```json
{
  "id": "booking_101",
  "serviceId": "service_456",
  "clientId": "user_789",
  "creatorId": "user_123",
  "status": "pending",
  "scheduledTime": "2024-01-15T10:00:00Z",
  "amount": 150.00,
  "currency": "USD",
  "createdAt": "2024-01-01T12:00:00Z"
}
```

### List Bookings
```http
GET /bookings
```

**Query Parameters:**
- `status` - Filter by booking status
- `creator_id` - Filter by creator
- `client_id` - Filter by client
- `start_date` - Filter by start date
- `end_date` - Filter by end date

### Update Booking
```http
PUT /bookings/{booking_id}
```

### Cancel Booking
```http
POST /bookings/{booking_id}/cancel
```

**Request:**
```json
{
  "reason": "Client cancellation",
  "refundRequested": true
}
```

## Payment Processing

### Process Payment
```http
POST /payments
```

**Request:**
```json
{
  "bookingId": "booking_101",
  "paymentMethodId": "pm_card_visa",
  "amount": 150.00,
  "currency": "USD"
}
```

### Get Payment Status
```http
GET /payments/{payment_id}
```

### Request Refund
```http
POST /refunds
```

**Request:**
```json
{
  "paymentId": "payment_202",
  "amount": 75.00,
  "reason": "Partial cancellation"
}
```

## Review System

### Create Review
```http
POST /reviews
```

**Request:**
```json
{
  "bookingId": "booking_101",
  "rating": 5,
  "comment": "Excellent work, very professional",
  "isPublic": true
}
```

### List Reviews
```http
GET /reviews
```

**Query Parameters:**
- `service_id` - Reviews for specific service
- `creator_id` - Reviews for specific creator
- `rating` - Filter by rating

### Get Review Aggregates
```http
GET /reviews/aggregate?target_id=service_456&target_type=service
```

**Response:**
```json
{
  "averageRating": 4.8,
  "totalReviews": 42,
  "distribution": {
    "5": 28,
    "4": 10,
    "3": 3,
    "2": 1,
    "1": 0
  }
}
```

## Search

### Search Services
```http
GET /search/services
```

**Query Parameters:**
- `q` - Search query
- `category` - Service category filter
- `location` - Location filter
- `min_price` - Minimum price
- `max_price` - Maximum price
- `rating` - Minimum rating
- `sort` - Sort order (price, rating, popularity)

### Search Users
```http
GET /search/users
```

**Query Parameters:**
- `q` - Search query
- `role` - User role filter
- `tier` - User tier filter
- `skills` - Skills filter

## Calendar Integration

### Get Availability
```http
GET /calendar/availability/{user_id}
```

**Query Parameters:**
- `start_date` - Start date for availability check
- `end_date` - End date for availability check
- `timezone` - Timezone for results

### Update Availability
```http
PUT /calendar/availability/{user_id}
```

**Request:**
```json
{
  "schedule": [
    {
      "dayOfWeek": "monday",
      "startTime": "09:00",
      "endTime": "17:00",
      "timezone": "America/New_York"
    }
  ],
  "blackoutDates": [
    "2024-01-15",
    "2024-01-16"
  ]
}
```

## Analytics

### Get Platform Metrics
```http
GET /analytics/platform
```

**Query Parameters:**
- `start_date` - Start date for metrics
- `end_date` - End date for metrics
- `granularity` - Data granularity (day, week, month)

### Get User Analytics
```http
GET /analytics/users/{user_id}
```

### Export Analytics Data
```http
GET /analytics/export
```

**Query Parameters:**
- `type` - Export type (csv, json)
- `metrics` - Specific metrics to include
- `date_range` - Date range for export

## Webhooks

### Create Webhook
```http
POST /webhooks
```

**Request:**
```json
{
  "url": "https://yoursite.com/webhook",
  "events": ["booking.created", "payment.completed"],
  "secret": "your_webhook_secret"
}
```

### Webhook Events
- `user.created`
- `user.updated`
- `service.created`
- `booking.created`
- `booking.updated`
- `payment.completed`
- `review.created`

### Webhook Payload Example
```json
{
  "id": "evt_123",
  "type": "booking.created",
  "data": {
    "booking": {
      "id": "booking_101",
      "serviceId": "service_456",
      "status": "pending"
    }
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

## SDKs and Libraries

### Official SDKs
- **JavaScript/Node.js**: `npm install @auditoryx/api-client`
- **Python**: `pip install auditoryx-api`
- **PHP**: `composer require auditoryx/api-client`

### Example Usage (JavaScript)
```javascript
import { AuditoryXAPI } from '@auditoryx/api-client';

const client = new AuditoryXAPI({
  apiKey: 'your_api_key',
  environment: 'production' // or 'staging'
});

// Get user profile
const user = await client.users.get('user_123');

// Create booking
const booking = await client.bookings.create({
  serviceId: 'service_456',
  clientId: 'user_789',
  scheduledTime: '2024-01-15T10:00:00Z'
});
```

## Testing

### Sandbox Environment
Use staging environment for testing:
```
Base URL: https://staging-api.auditoryx.com/v1
```

### Test Data
- Test API keys available in developer dashboard
- Sample data provided in staging environment
- Webhook testing tools available

## Support

### Documentation
- Interactive API explorer: [API Explorer URL]
- Postman collection: [Postman Collection URL]
- OpenAPI specification: [OpenAPI Spec URL]

### Developer Support
- Email: developers@auditoryx.com
- Community forum: [Forum URL]
- Discord channel: [Discord URL]

### Rate Limit Increases
Contact support for rate limit increases:
- Include use case description
- Expected request volume
- Business justification