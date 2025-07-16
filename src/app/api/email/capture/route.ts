import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { app } from '@/lib/firebase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, source, metadata } = body;

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email address' },
        { status: 400 }
      );
    }

    const db = getFirestore(app);
    const emailDocRef = doc(db, 'email_captures', email);

    // Check if email already exists
    const existingDoc = await getDoc(emailDocRef);
    const isExistingUser = existingDoc.exists();

    // Prepare email capture data
    const emailData = {
      email,
      source,
      metadata: {
        ...metadata,
        ip: request.ip || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        timestamp: serverTimestamp(),
      },
      firstCaptured: isExistingUser ? existingDoc.data()?.firstCaptured : serverTimestamp(),
      lastUpdated: serverTimestamp(),
      captureCount: isExistingUser ? (existingDoc.data()?.captureCount || 0) + 1 : 1,
      sources: isExistingUser 
        ? [...(existingDoc.data()?.sources || []), source].filter((v, i, a) => a.indexOf(v) === i)
        : [source],
    };

    // Save to Firestore
    await setDoc(emailDocRef, emailData, { merge: true });

    // Send welcome email for new subscribers
    if (!isExistingUser) {
      try {
        const welcomeResponse = await fetch(`${request.nextUrl.origin}/api/email/welcome`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            source,
            name: metadata?.name || null,
          }),
        });

        if (!welcomeResponse.ok) {
          console.warn('Failed to queue welcome email:', await welcomeResponse.text());
        }
      } catch (welcomeError) {
        console.warn('Welcome email error:', welcomeError);
        // Don't fail the main request if welcome email fails
      }
    }

    // Log analytics event
    console.log('Email captured:', {
      email: email.substring(0, 3) + '***', // Privacy-safe logging
      source,
      isNew: !isExistingUser,
      captureCount: emailData.captureCount,
    });

    // You can add integrations here:
    // - Send to ConvertKit/Mailchimp
    // - Trigger welcome email
    // - Update analytics
    // - Add to CRM

    return NextResponse.json({
      success: true,
      message: isExistingUser ? 'Email updated successfully' : 'Email captured successfully',
      isNew: !isExistingUser,
    });

  } catch (error) {
    console.error('Email capture error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve email capture stats (for admin dashboard)
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const email = url.searchParams.get(SCHEMA_FIELDS.USER.EMAIL);

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email parameter required' },
        { status: 400 }
      );
    }

    const db = getFirestore(app);
    const emailDocRef = doc(db, 'email_captures', email);
    const emailDoc = await getDoc(emailDocRef);

    if (!emailDoc.exists()) {
      return NextResponse.json(
        { success: false, message: 'Email not found' },
        { status: 404 }
      );
    }

    const data = emailDoc.data();
    
    // Return privacy-safe data
    return NextResponse.json({
      success: true,
      data: {
        email: email.substring(0, 3) + '***',
        source: data.source,
        sources: data.sources,
        captureCount: data.captureCount,
        firstCaptured: data.firstCaptured,
        lastUpdated: data.lastUpdated,
      },
    });

  } catch (error) {
    console.error('Email lookup error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
