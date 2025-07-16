# X-Open-Network API Documentation

## Overview

This document describes the REST API for the X-Open-Network platform. The API provides endpoints for user authentication, service management, booking functionality, and user availability.

## OpenAPI 3.0 Specification

```yaml
openapi: 3.0.3
info:
  title: X-Open-Network API
  description: API for the X-Open-Network creative services platform
  version: 1.0.0
  contact:
    name: X-Open-Network Team
    email: support@x-open-network.com
  license:
    name: MIT
    url: https://opensource.org/licenses/MIT

servers:
  - url: https://x-open-network.com/api
    description: Production server
  - url: http://localhost:3000/api
    description: Development server

components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: JWT token for authentication

  schemas:
    User:
      type: object
      properties:
        id:
          type: string
          description: Unique user identifier
        uid:
          type: string
          description: Firebase user ID
        email:
          type: string
          format: email
          description: User's email address
        displayName:
          type: string
          description: User's display name
        photoURL:
          type: string
          format: uri
          description: User's profile photo URL
        role:
          type: string
          enum: [artist, producer, engineer, videographer, studio, admin]
          description: User's role in the platform
        createdAt:
          type: integer
          description: User creation timestamp
        updatedAt:
          type: integer
          description: Last update timestamp

    Service:
      type: object
      properties:
        id:
          type: string
          description: Unique service identifier
        title:
          type: string
          description: Service title
        description:
          type: string
          description: Service description
        price:
          type: number
          description: Service price
        category:
          type: string
          description: Service category
        creatorId:
          type: string
          description: ID of the service creator
        creatorName:
          type: string
          description: Name of the service creator
        creatorAvatar:
          type: string
          format: uri
          description: Service creator's avatar URL
        createdAt:
          type: integer
          description: Service creation timestamp
        updatedAt:
          type: integer
          description: Last update timestamp
        isActive:
          type: boolean
          description: Whether the service is active
        tags:
          type: array
          items:
            type: string
          description: Service tags
        location:
          type: string
          description: Service location
        duration:
          type: integer
          description: Service duration in minutes
        images:
          type: array
          items:
            type: string
            format: uri
          description: Service images

    Availability:
      type: object
      properties:
        id:
          type: string
          description: Unique availability identifier
        uid:
          type: string
          description: User ID
        role:
          type: string
          enum: [artist, producer, engineer, videographer, studio]
          description: User's role
        timeSlot:
          type: string
          description: Time slot description
        createdAt:
          type: string
          description: Creation timestamp
        isAvailable:
          type: boolean
          description: Whether the user is available
        date:
          type: string
          format: date
          description: Availability date
        startTime:
          type: string
          format: time
          description: Start time
        endTime:
          type: string
          format: time
          description: End time

    UserAvailability:
      type: object
      properties:
        location:
          type: string
          description: User's location
        availability:
          type: array
          items:
            type: object
            properties:
              day:
                type: string
                description: Day of the week
              time:
                type: string
                description: Time slot
        uid:
          type: string
          description: User ID
        updatedAt:
          type: integer
          description: Last update timestamp

    ArtistService:
      type: object
      properties:
        id:
          type: string
          description: Unique artist service identifier
        artistId:
          type: string
          description: Artist user ID
        service:
          type: string
          description: Service name
        description:
          type: string
          description: Service description
        createdAt:
          type: string
          description: Creation timestamp

    ErrorResponse:
      type: object
      properties:
        error:
          type: string
          description: Error message
        issues:
          type: object
          description: Validation issues (if applicable)

    SuccessResponse:
      type: object
      properties:
        success:
          type: boolean
          description: Operation success status

security:
  - BearerAuth: []

paths:
  /auth/session:
    post:
      summary: Create session token
      description: Creates a JWT session token for backend API authorization
      tags:
        - Authentication
      security: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                email:
                  type: string
                  format: email
                  description: User's email address
                uid:
                  type: string
                  description: Firebase user ID
              required:
                - email
                - uid
      responses:
        '200':
          description: Session token created successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  token:
                    type: string
                    description: JWT token for API access
                  user:
                    type: object
                    properties:
                      id:
                        type: string
                        description: User ID
                      email:
                        type: string
                        format: email
                        description: User's email
        '401':
          description: Authentication failed
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'

  /auth/verify:
    get:
      summary: Verify JWT token
      description: Verifies a JWT token and returns user information
      tags:
        - Authentication
      responses:
        '200':
          description: Token is valid
          content:
            application/json:
              schema:
                type: object
                properties:
                  verified:
                    type: boolean
                    description: Token verification status
                  uid:
                    type: string
                    description: User ID
                  email:
                    type: string
                    format: email
                    description: User's email
        '401':
          description: Invalid or missing token
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'

  /services:
    get:
      summary: Get all services
      description: Retrieves all services available in the platform
      tags:
        - Services
      security: []
      responses:
        '200':
          description: Services retrieved successfully
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Service'

    post:
      summary: Create a new service
      description: Creates a new service for the authenticated user
      tags:
        - Services
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                title:
                  type: string
                  description: Service title
                description:
                  type: string
                  description: Service description
                price:
                  type: number
                  description: Service price
                category:
                  type: string
                  description: Service category
                tags:
                  type: array
                  items:
                    type: string
                  description: Service tags
                location:
                  type: string
                  description: Service location
                duration:
                  type: integer
                  description: Service duration in minutes
                images:
                  type: array
                  items:
                    type: string
                    format: uri
                  description: Service images
              required:
                - title
                - description
                - price
      responses:
        '200':
          description: Service created successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  id:
                    type: string
                    description: Created service ID
        '400':
          description: Missing required fields
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '401':
          description: Unauthorized
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'

    put:
      summary: Update a service
      description: Updates an existing service owned by the authenticated user
      tags:
        - Services
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                id:
                  type: string
                  description: Service ID to update
                updates:
                  type: object
                  description: Fields to update
              required:
                - id
                - updates
      responses:
        '200':
          description: Service updated successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SuccessResponse'
        '400':
          description: Missing required fields
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '403':
          description: Forbidden - user doesn't own the service
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'

    delete:
      summary: Delete a service
      description: Deletes an existing service owned by the authenticated user
      tags:
        - Services
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                id:
                  type: string
                  description: Service ID to delete
              required:
                - id
      responses:
        '200':
          description: Service deleted successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SuccessResponse'
        '400':
          description: Missing service ID
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '403':
          description: Forbidden - user doesn't own the service
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'

  /availability:
    get:
      summary: Get availability
      description: Retrieves availability information with optional filtering
      tags:
        - Availability
      security: []
      parameters:
        - name: role
          in: query
          description: Filter by user role
          schema:
            type: string
            enum: [artist, producer, engineer, videographer, studio]
        - name: uid
          in: query
          description: Filter by user ID
          schema:
            type: string
      responses:
        '200':
          description: Availability retrieved successfully
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Availability'
        '500':
          description: Server error
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'

    post:
      summary: Create availability
      description: Creates a new availability slot for the authenticated user
      tags:
        - Availability
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                timeSlot:
                  type: string
                  description: Time slot description
                role:
                  type: string
                  enum: [artist, producer, engineer, videographer, studio]
                  description: User's role
              required:
                - timeSlot
                - role
      responses:
        '200':
          description: Availability created successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SuccessResponse'
        '400':
          description: Missing required data
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '401':
          description: Unauthorized
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'

  /artist-services:
    get:
      summary: Get artist services
      description: Retrieves all artist services
      tags:
        - Artist Services
      security: []
      responses:
        '200':
          description: Artist services retrieved successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  services:
                    type: array
                    items:
                      $ref: '#/components/schemas/ArtistService'
        '500':
          description: Server error
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'

    post:
      summary: Create artist service
      description: Creates a new artist service for the authenticated user
      tags:
        - Artist Services
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                artistId:
                  type: string
                  description: Artist user ID
                service:
                  type: string
                  description: Service name
                description:
                  type: string
                  description: Service description
              required:
                - artistId
                - service
                - description
      responses:
        '200':
          description: Artist service created successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SuccessResponse'
        '400':
          description: Missing required fields
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '401':
          description: Unauthorized
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '403':
          description: Forbidden - artistId doesn't match authenticated user
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'

  /profile/availability:
    get:
      summary: Get user availability profile
      description: Retrieves the availability profile for a specific user
      tags:
        - Profile
      parameters:
        - name: uid
          in: query
          required: true
          description: User ID
          schema:
            type: string
      responses:
        '200':
          description: User availability retrieved successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UserAvailability'
        '400':
          description: Missing uid parameter
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '401':
          description: Unauthorized
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '403':
          description: Forbidden - can only access own profile
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'

    post:
      summary: Update user availability profile
      description: Updates the availability profile for the authenticated user
      tags:
        - Profile
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                location:
                  type: string
                  description: User's location
                availability:
                  type: array
                  items:
                    type: object
                    properties:
                      day:
                        type: string
                        description: Day of the week
                      time:
                        type: string
                        description: Time slot
                    required:
                      - day
                      - time
              required:
                - location
                - availability
      responses:
        '200':
          description: User availability updated successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SuccessResponse'
        '400':
          description: Invalid input
          content:
            application/json:
              schema:
                type: object
                properties:
                  error:
                    type: string
                    description: Error message
                  issues:
                    type: object
                    description: Validation issues
        '401':
          description: Unauthorized
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '503':
          description: Firebase services not available
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'

tags:
  - name: Authentication
    description: User authentication and session management
  - name: Services
    description: Service management operations
  - name: Availability
    description: User availability management
  - name: Artist Services
    description: Artist-specific service operations
  - name: Profile
    description: User profile management
```

## Authentication

The API uses JWT Bearer tokens for authentication. To authenticate requests:

1. Obtain a session token by calling `/auth/session` with email and Firebase uid
2. Include the token in the Authorization header: `Authorization: Bearer <token>`
3. The token can be verified using the `/auth/verify` endpoint

## Error Handling

The API returns standard HTTP status codes:

- `200` - Success
- `400` - Bad Request (missing or invalid parameters)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `500` - Internal Server Error
- `503` - Service Unavailable (Firebase services not available)

Error responses include a JSON object with an `error` field containing a descriptive message.

## Rate Limiting

Currently, no rate limiting is implemented. This should be added in a future version.

## Data Models

### Service Categories
- `artist` - Artist services
- `producer` - Producer services  
- `engineer` - Engineering services
- `videographer` - Videography services
- `studio` - Studio services

### User Roles
- `artist` - Musical artist
- `producer` - Music producer
- `engineer` - Audio engineer
- `videographer` - Video professional
- `studio` - Recording studio
- `admin` - Platform administrator

## Development

For local development, ensure you have:
1. Firebase project configured
2. Environment variables set (see `.env.example`)
3. Firebase emulators running for testing

## Contributing

Please follow the existing TypeScript patterns and ensure all endpoints are properly typed.