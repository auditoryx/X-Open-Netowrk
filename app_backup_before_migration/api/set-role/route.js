import { getAuth } from 'firebase-admin/auth';
import { adminApp } from '@/lib/firebaseAdmin';

export async function POST(req) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.split('Bearer ')[1];

    if (!token) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const decoded = await getAuth(adminApp).verifyIdToken(token);

    const { role } = await req.json();

    if (!role) {
      return new Response(JSON.stringify({ error: 'Missing role' }), { status: 400 });
    }

    await getAuth(adminApp).setCustomUserClaims(decoded.uid, { role });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
