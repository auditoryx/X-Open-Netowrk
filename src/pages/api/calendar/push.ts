import { getSession } from 'next-auth/react';
import { pushToGoogleCalendar } from '@/lib/google/calendar';
import { z } from 'zod';

const SlotSchema = z.array(
  z.object({
    day: z.string().min(1),
    time: z.string().min(1),
  })
);

import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getSession({ req });

  if (!session || !session.accessToken || !session.user?.email) {
    console.warn('Unauthorized calendar push attempt');
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const parse = SlotSchema.safeParse(req.body?.slots);
  if (!parse.success) {
    console.error('Invalid slot payload:', parse.error.format());
    return res.status(400).json({ error: 'Invalid slot data' });
  }

  try {
    await pushToGoogleCalendar(session.accessToken, session.user.email, parse.data);
    return res.status(200).json({ success: true });
  } catch (err: any) {
    console.error('Push to Google Calendar failed:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
// This code handles a POST request to push booking slots to Google Calendar.
// It checks for authentication, validates the input data, and calls a function to perform the push.
// If successful, it returns a success response; otherwise, it returns an error response.
// The code uses zod for input validation and next-auth for session management.
// The handler function is exported as the default export of the module.
// The function `pushToGoogleCalendar` is assumed to be defined in the `lib/google/calendar` module.
// The `SlotSchema` is defined using zod to ensure the input data structure is correct.
// The `handler` function is an asynchronous function that handles the HTTP request and response.
