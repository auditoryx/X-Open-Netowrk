import { getSession } from 'next-auth/react';
import { syncFromGoogleCalendar } from '@/lib/google/calendar';
import type { NextApiRequest, NextApiResponse } from 'next';
import { Sentry } from '@lib/sentry';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getSession({ req });

  if (!session || !session.accessToken || !session.user?.email) {
    console.warn('Unauthorized calendar sync attempt');
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const uid = session.user.email;
    const slots = await syncFromGoogleCalendar(session.accessToken, uid);
    return res.status(200).json({ synced: slots });
  } catch (err: any) {
    console.error('Calendar sync failed:', err.message);
    Sentry.captureException(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
// This code handles a GET request to sync booking slots from Google Calendar.
// It checks for authentication, retrieves the access token and user email from the session,
// and calls a function to perform the sync.
// If successful, it returns the synced slots; otherwise, it returns an error response.