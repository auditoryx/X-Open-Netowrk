# Calendar Integration System

## Overview

The AuditoryX calendar integration system provides comprehensive calendar synchronization and conflict detection across multiple providers.

## Features

✅ **Google Calendar Integration** - Full sync with Google Calendar API
✅ **Microsoft Calendar Integration** - Complete Microsoft Graph integration  
✅ **Unified Conflict Detection** - Check conflicts across all calendar sources
✅ **Alternative Slot Suggestions** - Automatically suggest available alternatives
✅ **Real-time Sync** - Bidirectional calendar synchronization
✅ **Comprehensive API** - RESTful endpoints for all calendar operations

## Calendar Providers Supported

### Google Calendar
- **OAuth Integration**: Google OAuth 2.0
- **Features**: Import/export events, conflict detection, real-time sync
- **API**: `/api/calendar/sync` and `/api/calendar/push`

### Microsoft Calendar  
- **OAuth Integration**: Microsoft Graph API
- **Features**: Outlook/365 calendar sync, conflict detection
- **API**: `/api/calendar/microsoft/sync`

## Conflict Detection

The system checks for conflicts across multiple sources:

1. **Internal Bookings** - Existing AuditoryX bookings
2. **Google Calendar** - Events from connected Google Calendar
3. **Microsoft Calendar** - Events from connected Outlook/365
4. **Blocked Slots** - Manually blocked time periods

### Conflict Detection API

```typescript
// Check single time slot
POST /api/calendar/conflicts
{
  "startTime": "2024-01-15T10:00:00Z",
  "endTime": "2024-01-15T11:00:00Z",
  "timezone": "UTC",
  "excludeBookingId": "optional-booking-id"
}

// Response
{
  "hasConflict": false,
  "conflictSources": [],
  "availableAlternatives": [
    {
      "startTime": "2024-01-15T11:00:00Z",
      "endTime": "2024-01-15T12:00:00Z",
      "confidence": "high",
      "timezone": "UTC"
    }
  ]
}
```

### Bulk Conflict Check

```typescript
// Check multiple slots at once
PUT /api/calendar/conflicts
{
  "slots": [
    {
      "startTime": "2024-01-15T10:00:00Z",
      "endTime": "2024-01-15T11:00:00Z",
      "timezone": "UTC"
    }
    // ... up to 50 slots
  ]
}
```

## Usage Examples

### Frontend Integration

```tsx
import { useState } from 'react';

function AvailabilityChecker({ providerId, selectedSlot }) {
  const [conflicts, setConflicts] = useState(null);
  const [loading, setLoading] = useState(false);

  const checkConflicts = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/calendar/conflicts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startTime: selectedSlot.startTime,
          endTime: selectedSlot.endTime,
          timezone: selectedSlot.timezone,
          providerId
        })
      });
      
      const result = await response.json();
      setConflicts(result);
    } catch (error) {
      console.error('Conflict check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={checkConflicts} disabled={loading}>
        Check Availability
      </button>
      
      {conflicts?.hasConflict && (
        <div className="conflict-warning">
          <p>Time slot has conflicts:</p>
          <ul>
            {conflicts.conflictSources.map((conflict, index) => (
              <li key={index}>
                {conflict.title} ({conflict.source})
              </li>
            ))}
          </ul>
          
          {conflicts.availableAlternatives && (
            <div>
              <p>Suggested alternatives:</p>
              {conflicts.availableAlternatives.map((alt, index) => (
                <button key={index} onClick={() => selectAlternative(alt)}>
                  {formatTime(alt.startTime)} - {formatTime(alt.endTime)}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

### Calendar Sync

```tsx
import { CalendarSync } from '@/components/calendar/CalendarSync';

function CalendarSettings() {
  return (
    <div>
      <h2>Calendar Integration</h2>
      <CalendarSync 
        onSyncComplete={() => {
          console.log('Calendar synced successfully');
        }}
      />
    </div>
  );
}
```

## API Reference

### Calendar Management

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/calendar` | GET | Get user's calendar availability |
| `/api/calendar` | POST | Create calendar event |
| `/api/calendar` | PUT | Update availability settings |
| `/api/calendar` | DELETE | Delete calendar event |

### Google Calendar Integration

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/calendar/sync` | GET | Get Google calendar info |
| `/api/calendar/sync` | POST | Sync from Google Calendar |
| `/api/calendar/push` | POST | Push availability to Google |

### Microsoft Calendar Integration

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/calendar/microsoft` | GET | Get Microsoft calendar info |
| `/api/calendar/microsoft` | POST | Sync Microsoft calendar |

### Conflict Detection

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/calendar/conflicts` | GET | Get availability for date range |
| `/api/calendar/conflicts` | POST | Check single slot for conflicts |
| `/api/calendar/conflicts` | PUT | Bulk conflict check |

## Implementation Status

### ✅ Completed Features

1. **Google Calendar Integration**
   - OAuth setup and token management
   - Import events and detect busy slots
   - Export availability to Google Calendar
   - Conflict detection with existing events

2. **Microsoft Calendar Integration**  
   - Microsoft Graph API integration
   - Outlook/365 calendar sync
   - Event creation and management
   - User settings and timezone detection

3. **Unified Conflict Detection**
   - Multi-source conflict checking
   - Alternative slot suggestions
   - Bulk conflict detection API
   - Comprehensive availability reporting

4. **API Infrastructure**
   - RESTful API endpoints
   - Input validation with Zod schemas
   - Error handling and logging
   - Authentication and authorization

### 🔄 Enhanced Features (Beyond Basic Requirements)

1. **Advanced Conflict Resolution**
   - Smart alternative suggestion algorithm
   - Confidence scoring for alternatives
   - Timezone-aware scheduling

2. **Real-time Synchronization**
   - Webhook support for calendar updates
   - Background sync jobs
   - Sync status tracking and error recovery

3. **Multi-provider Support**
   - Unified interface for Google and Microsoft
   - Easy extension for additional providers
   - Provider-specific feature handling

## Security Features

- **OAuth 2.0** for secure calendar access
- **Token refresh** handling
- **Scope-limited permissions** (read-only where possible)
- **Audit logging** for all calendar operations
- **User consent** for calendar access

## Performance Optimizations

- **Bulk operations** for multiple slot checks
- **Caching** of calendar data
- **Rate limiting** for external API calls
- **Background processing** for sync operations

## Testing

The calendar system includes comprehensive test coverage for:
- Conflict detection logic
- API endpoint validation
- Error handling scenarios
- Edge cases and timezone handling

## Future Enhancements

1. **Additional Calendar Providers**
   - Apple iCloud Calendar
   - CalDAV support
   - Zoom/Teams calendar integration

2. **Smart Scheduling**
   - AI-powered optimal time suggestions
   - Travel time consideration
   - Recurring availability patterns

3. **Team Scheduling**
   - Multi-user availability checking
   - Team calendar coordination
   - Resource booking integration