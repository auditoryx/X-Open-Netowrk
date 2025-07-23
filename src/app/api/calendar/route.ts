import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import withAuth from '@/app/api/_utils/withAuth';
import { z } from 'zod';

// Calendar event schema
const calendarEventSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  bookingId: z.string().optional(),
  type: z.enum(['booking', 'blocked', 'available']),
  recurring: z.object({
    frequency: z.enum(['none', 'daily', 'weekly', 'monthly']),
    interval: z.number().min(1).max(52).optional(),
    endDate: z.string().datetime().optional()
  }).optional()
});

// Availability update schema
const availabilityUpdateSchema = z.object({
  timeSlots: z.array(z.object({
    dayOfWeek: z.number().min(0).max(6), // 0 = Sunday
    startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/), // HH:MM format
    endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    timezone: z.string().optional()
  })),
  blackoutDates: z.array(z.object({
    date: z.string().datetime(),
    reason: z.string().max(200).optional()
  })).optional(),
  bufferTime: z.number().min(0).max(240).optional() // minutes
});

async function handler(req: NextRequest & { user: any }) {
  const userId = req.user.uid;

  if (req.method === 'GET') {
    return await getAvailability(userId, req);
  } else if (req.method === 'POST') {
    return await createEvent(userId, req);
  } else if (req.method === 'PUT') {
    return await updateAvailability(userId, req);
  } else if (req.method === 'DELETE') {
    return await deleteEvent(userId, req);
  }

  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

/**
 * Get user's calendar availability
 */
async function getAvailability(userId: string, req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'startDate and endDate parameters are required' },
        { status: 400 }
      );
    }

    // Get user's availability settings
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userDoc.data();
    const availability = userData.availability || {
      timeSlots: [],
      blackoutDates: [],
      bufferTime: 30
    };

    // Generate available time slots for the date range
    const availableSlots = generateAvailableSlots(
      availability,
      new Date(startDate),
      new Date(endDate)
    );

    // Get existing bookings and events
    const events = userData.calendarEvents || [];
    const filteredEvents = events.filter((event: any) => {
      const eventStart = new Date(event.startTime);
      const eventEnd = new Date(event.endTime);
      const rangeStart = new Date(startDate);
      const rangeEnd = new Date(endDate);

      return eventStart <= rangeEnd && eventEnd >= rangeStart;
    });

    return NextResponse.json({
      availability: availability,
      availableSlots: availableSlots,
      events: filteredEvents,
      timezone: userData.timezone || 'UTC'
    });

  } catch (error) {
    logger.error('Get availability error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch availability' },
      { status: 500 }
    );
  }
}

/**
 * Create a new calendar event
 */
async function createEvent(userId: string, req: NextRequest) {
  try {
    const body = await req.json();
    const validatedEvent = calendarEventSchema.parse(body);

    // Validate time range
    const startTime = new Date(validatedEvent.startTime);
    const endTime = new Date(validatedEvent.endTime);

    if (endTime <= startTime) {
      return NextResponse.json(
        { error: 'End time must be after start time' },
        { status: 400 }
      );
    }

    // Check for conflicts
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userDoc.data();
    const existingEvents = userData.calendarEvents || [];

    const hasConflict = existingEvents.some((event: any) => {
      const eventStart = new Date(event.startTime);
      const eventEnd = new Date(event.endTime);
      return startTime < eventEnd && endTime > eventStart;
    });

    if (hasConflict) {
      return NextResponse.json(
        { error: 'Time slot conflicts with existing event' },
        { status: 409 }
      );
    }

    // Create event
    const newEvent = {
      id: generateEventId(),
      ...validatedEvent,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Add event to user's calendar
    const updatedEvents = [...existingEvents, newEvent];

    await updateDoc(doc(db, 'users', userId), {
      calendarEvents: updatedEvents,
      updatedAt: serverTimestamp()
    });

    logger.info('Calendar event created', { userId, eventId: newEvent.id });

    return NextResponse.json({
      event: newEvent,
      message: 'Event created successfully'
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid event data', details: error.format() },
        { status: 400 }
      );
    }

    logger.error('Create event error:', error);
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
}

/**
 * Update user's availability settings
 */
async function updateAvailability(userId: string, req: NextRequest) {
  try {
    const body = await req.json();
    const validatedAvailability = availabilityUpdateSchema.parse(body);

    // Validate time slots
    for (const slot of validatedAvailability.timeSlots) {
      if (slot.endTime <= slot.startTime) {
        return NextResponse.json(
          { error: `Invalid time slot: ${slot.startTime} - ${slot.endTime}` },
          { status: 400 }
        );
      }
    }

    await updateDoc(doc(db, 'users', userId), {
      availability: validatedAvailability,
      updatedAt: serverTimestamp()
    });

    logger.info('Availability updated', { userId });

    return NextResponse.json({
      availability: validatedAvailability,
      message: 'Availability updated successfully'
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid availability data', details: error.format() },
        { status: 400 }
      );
    }

    logger.error('Update availability error:', error);
    return NextResponse.json(
      { error: 'Failed to update availability' },
      { status: 500 }
    );
  }
}

/**
 * Delete a calendar event
 */
async function deleteEvent(userId: string, req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const eventId = searchParams.get('eventId');

    if (!eventId) {
      return NextResponse.json(
        { error: 'eventId parameter is required' },
        { status: 400 }
      );
    }

    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userDoc.data();
    const existingEvents = userData.calendarEvents || [];

    // Find and remove the event
    const eventIndex = existingEvents.findIndex((event: any) => event.id === eventId);
    if (eventIndex === -1) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const updatedEvents = existingEvents.filter((event: any) => event.id !== eventId);

    await updateDoc(doc(db, 'users', userId), {
      calendarEvents: updatedEvents,
      updatedAt: serverTimestamp()
    });

    logger.info('Calendar event deleted', { userId, eventId });

    return NextResponse.json({
      message: 'Event deleted successfully'
    });

  } catch (error) {
    logger.error('Delete event error:', error);
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    );
  }
}

/**
 * Generate available time slots based on availability settings
 */
function generateAvailableSlots(
  availability: any,
  startDate: Date,
  endDate: Date
): any[] {
  const slots = [];
  const { timeSlots, blackoutDates, bufferTime = 30 } = availability;

  // Iterate through each day in the range
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay();
    
    // Check if this day has availability
    const daySlots = timeSlots.filter((slot: any) => slot.dayOfWeek === dayOfWeek);
    
    if (daySlots.length > 0) {
      // Check if this date is blacked out
      const isBlackedOut = blackoutDates?.some((blackout: any) => {
        const blackoutDate = new Date(blackout.date);
        return blackoutDate.toDateString() === currentDate.toDateString();
      });

      if (!isBlackedOut) {
        for (const slot of daySlots) {
          const [startHour, startMinute] = slot.startTime.split(':').map(Number);
          const [endHour, endMinute] = slot.endTime.split(':').map(Number);

          const slotStart = new Date(currentDate);
          slotStart.setHours(startHour, startMinute, 0, 0);

          const slotEnd = new Date(currentDate);
          slotEnd.setHours(endHour, endMinute, 0, 0);

          // Generate time slots with buffer time
          const slotDuration = 60; // 1 hour slots by default
          let currentSlotTime = new Date(slotStart);

          while (currentSlotTime < slotEnd) {
            const nextSlotTime = new Date(currentSlotTime);
            nextSlotTime.setMinutes(nextSlotTime.getMinutes() + slotDuration);

            if (nextSlotTime <= slotEnd) {
              slots.push({
                startTime: currentSlotTime.toISOString(),
                endTime: nextSlotTime.toISOString(),
                available: true,
                duration: slotDuration
              });
            }

            currentSlotTime.setMinutes(currentSlotTime.getMinutes() + slotDuration + bufferTime);
          }
        }
      }
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return slots;
}

/**
 * Generate unique event ID
 */
function generateEventId(): string {
  return 'evt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

export const GET = withAuth(handler);
export const POST = withAuth(handler);
export const PUT = withAuth(handler);
export const DELETE = withAuth(handler);