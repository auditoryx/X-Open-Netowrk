// Calendar Integration Exports

// Core services
export {
  GoogleCalendarService,
  type GoogleCalendarConfig,
  type CalendarEvent,
  type SyncResult
} from './google-calendar';

export {
  AvailabilityService,
  type TimeSlot,
  type BlackoutDate,
  type AvailabilitySettings,
  type AvailableSlot,
  type ConflictCheck
} from './availability';

export {
  ConflictDetectionService,
  type ConflictResult,
  type ConflictEvent,
  type AlternativeSlot,
  type BookingRequest
} from './conflict-detection';

// Existing exports
export {
  exportToICal,
  type CalendarEvent as ICCalEvent
} from './exportToICal';

export {
  importICal
} from './importICal';