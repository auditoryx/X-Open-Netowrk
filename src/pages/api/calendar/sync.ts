import { getSession } from 'next-auth/react';
import { syncFromGoogleCalendar } from '@/lib/google/calendar';

export default async function handler(req, res) {
  const session = await getSession({ req });

  if (!session || !session.accessToken) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const uid = session.user?.email || 'unknown'; // Adjust if you store UID elsewhere
  const slots = await syncFromGoogleCalendar(session.accessToken as string, uid);

  return res.status(200).json({ synced: slots });
}
