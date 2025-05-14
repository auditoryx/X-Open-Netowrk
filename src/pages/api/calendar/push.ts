import { getSession } from 'next-auth/react';
import { pushToGoogleCalendar } from '@/lib/google/calendar';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getSession({ req });
  if (!session || !session.accessToken || !session.user?.email) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const { slots } = req.body as { day: string; time: string }[];
  try {
    await pushToGoogleCalendar(session.accessToken, session.user.email, slots);
    return res.status(200).json({ success: true });
  } catch (err: any) {
    console.error('Push to GCal failed:', err);
    return res.status(500).json({ error: 'Failed to push to Google Calendar' });
  }
}
