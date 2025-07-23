'use client';

import React, { useState, useEffect } from 'react';
import { LoadingSpinner } from '@/components/ui/LoadingComponents';
import { ErrorDisplay } from '@/components/errors/ErrorComponents';
import { useErrorHandler } from '@/components/errors/ErrorComponents';

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  type: 'booking' | 'blocked' | 'available';
  bookingId?: string;
}

interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
  duration: number;
}

interface CalendarProps {
  userId?: string;
  onEventSelect?: (event: CalendarEvent) => void;
  onSlotSelect?: (slot: TimeSlot) => void;
  editable?: boolean;
  className?: string;
}

export default function Calendar({
  userId,
  onEventSelect,
  onSlotSelect,
  editable = false,
  className = ''
}: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { error, handleError, clearError } = useErrorHandler();

  // Calculate date range for current month
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

  useEffect(() => {
    loadCalendarData();
  }, [currentDate, userId]);

  const loadCalendarData = async () => {
    if (!userId) return;

    setLoading(true);
    clearError();

    try {
      const startDate = startOfMonth.toISOString();
      const endDate = endOfMonth.toISOString();

      const response = await fetch(
        `/api/calendar?startDate=${startDate}&endDate=${endDate}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}` // Assuming token-based auth
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to load calendar data');
      }

      const data = await response.json();
      setEvents(data.events || []);
      setAvailableSlots(data.availableSlots || []);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const getDaysInMonth = () => {
    const daysInMonth = endOfMonth.getDate();
    const firstDayOfWeek = startOfMonth.getDay();
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
    }

    return days;
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.startTime);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const getSlotsForDate = (date: Date) => {
    return availableSlots.filter(slot => {
      const slotDate = new Date(slot.startTime);
      return slotDate.toDateString() === date.toDateString();
    });
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const handleEventClick = (event: CalendarEvent) => {
    if (onEventSelect) {
      onEventSelect(event);
    }
  };

  const handleSlotClick = (slot: TimeSlot) => {
    if (onSlotSelect) {
      onSlotSelect(slot);
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg border p-6 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="large" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg border p-6 ${className}`}>
        <ErrorDisplay error={error} onRetry={loadCalendarData} />
      </div>
    );
  }

  const days = getDaysInMonth();
  const today = new Date();

  return (
    <div className={`bg-white rounded-lg border ${className}`}>
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <button
          onClick={() => navigateMonth('prev')}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <h2 className="text-lg font-semibold">
          {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h2>
        
        <button
          onClick={() => navigateMonth('next')}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Days of Week Header */}
      <div className="grid grid-cols-7 border-b">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-3 text-sm font-medium text-gray-500 text-center">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {days.map((date, index) => {
          if (!date) {
            return <div key={index} className="h-24 border-b border-r"></div>;
          }

          const dayEvents = getEventsForDate(date);
          const daySlots = getSlotsForDate(date);
          const isToday = date.toDateString() === today.toDateString();
          const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
          const isPast = date < today;

          return (
            <div
              key={date.toISOString()}
              onClick={() => handleDateClick(date)}
              className={`
                h-24 border-b border-r p-1 cursor-pointer hover:bg-gray-50
                ${isSelected ? 'bg-blue-50 border-blue-200' : ''}
                ${isPast ? 'bg-gray-50 text-gray-400' : ''}
              `}
            >
              <div className={`
                text-sm font-medium mb-1
                ${isToday ? 'text-blue-600 font-bold' : ''}
              `}>
                {date.getDate()}
              </div>

              {/* Events */}
              <div className="space-y-1">
                {dayEvents.slice(0, 2).map(event => (
                  <div
                    key={event.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEventClick(event);
                    }}
                    className={`
                      text-xs px-1 py-0.5 rounded truncate cursor-pointer
                      ${event.type === 'booking' ? 'bg-blue-100 text-blue-800' :
                        event.type === 'blocked' ? 'bg-red-100 text-red-800' :
                        'bg-green-100 text-green-800'}
                    `}
                    title={event.title}
                  >
                    {event.title}
                  </div>
                ))}
                
                {dayEvents.length > 2 && (
                  <div className="text-xs text-gray-500">
                    +{dayEvents.length - 2} more
                  </div>
                )}

                {/* Available slots indicator */}
                {daySlots.length > 0 && dayEvents.length === 0 && (
                  <div className="text-xs text-green-600 font-medium">
                    {daySlots.length} slots
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Date Details */}
      {selectedDate && (
        <div className="border-t p-4">
          <h3 className="font-medium mb-3">
            {selectedDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h3>

          {/* Events for selected date */}
          {getEventsForDate(selectedDate).length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Events</h4>
              <div className="space-y-2">
                {getEventsForDate(selectedDate).map(event => (
                  <div
                    key={event.id}
                    onClick={() => handleEventClick(event)}
                    className="p-2 rounded border cursor-pointer hover:bg-gray-50"
                  >
                    <div className="font-medium">{event.title}</div>
                    <div className="text-sm text-gray-600">
                      {new Date(event.startTime).toLocaleTimeString()} - {new Date(event.endTime).toLocaleTimeString()}
                    </div>
                    {event.description && (
                      <div className="text-sm text-gray-500 mt-1">{event.description}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Available slots for selected date */}
          {getSlotsForDate(selectedDate).length > 0 && editable && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Available Time Slots</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {getSlotsForDate(selectedDate).map((slot, index) => (
                  <button
                    key={index}
                    onClick={() => handleSlotClick(slot)}
                    className="p-2 text-sm border rounded hover:bg-green-50 hover:border-green-300"
                  >
                    {new Date(slot.startTime).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </button>
                ))}
              </div>
            </div>
          )}

          {getEventsForDate(selectedDate).length === 0 && getSlotsForDate(selectedDate).length === 0 && (
            <p className="text-gray-500 text-sm">No events or available slots for this date.</p>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Calendar legend component
 */
export function CalendarLegend() {
  return (
    <div className="bg-white rounded-lg border p-4">
      <h3 className="font-medium mb-3">Legend</h3>
      <div className="space-y-2">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-blue-100 rounded mr-2"></div>
          <span className="text-sm">Bookings</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-red-100 rounded mr-2"></div>
          <span className="text-sm">Blocked Time</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-green-100 rounded mr-2"></div>
          <span className="text-sm">Available</span>
        </div>
      </div>
    </div>
  );
}