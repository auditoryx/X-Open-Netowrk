import { google } from 'googleapis';
import { adminDb } from '@/lib/firebase-admin';
import { DateTime } from 'luxon';
import { getNextDateForWeekday } from '@/lib/google/utils';

type Slot = { day: string; time: string };

export async function syncFromGoogleCalendar(token: string, uid: string) {
  const oAuth2Client = new google.auth.OAuth2();
  oAuth2Client.setCredentials({ access_token: token });

  const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

  const res = await calendar.events.list({
    calendarId: 'primary',
    timeMin: new Date().toISOString(),
    maxResults: 50,
    singleEvents: true,
    orderBy: 'startTime',
  });

  const events = res.data.items || [];

  const busySlots: Slot[] = events.map((event) => {
    const date = new Date(event.start?.dateTime || event.start?.date || '');
    const day = date.toLocaleDateString('en-US', { weekday: 'long' });
    const time = date.toTimeString().slice(0, 5);
    return { day, time };
  });

  await adminDb.doc(`availability/${uid}`).set({
    busySlots,
    lastSynced: new Date().toISOString(),
  }, { merge: true });

  return busySlots;
}

export async function pushToGoogleCalendar(
  token: string,
  uid: string,
  slots: Slot[],
  timezone: string
) {
  const oAuth2Client = new google.auth.OAuth2();
  oAuth2Client.setCredentials({ access_token: token });

  const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

  for (const slot of slots) {
    const nextDate = getNextDateForWeekday(slot.day);

    const start = DateTime.fromISO(`${nextDate}T${slot.time}`, { zone: timezone });
    const end = start.plus({ minutes: 30 });

    await calendar.events.insert({
      calendarId: 'primary',
      requestBody: {
        summary: 'Available via AuditoryX',
        description: 'Booked through AuditoryX Platform',
        start: { dateTime: start.toISO(), timeZone: timezone },
        end: { dateTime: end.toISO(), timeZone: timezone },
      },
    });
  }
}

