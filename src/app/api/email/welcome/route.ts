import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { app } from '@/lib/firebase';

// Email template data
interface WelcomeEmailData {
  email: string;
  source: string;
  name?: string;
}

// Email templates
const getWelcomeEmailTemplate = (data: WelcomeEmailData) => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://auditoryx.com';
  
  return {
    subject: '🎵 Welcome to AuditoryX - Your Creative Journey Starts Now!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to AuditoryX</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; margin: 0; padding: 0; background-color: #0a0a0a; color: #ffffff; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; padding: 40px 0; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border-radius: 12px; margin-bottom: 30px; }
          .logo { font-size: 32px; font-weight: bold; color: white; margin-bottom: 10px; }
          .hero-text { font-size: 18px; color: #e5e7eb; }
          .content { padding: 0 20px; }
          .feature { background: #1f1f1f; border: 1px solid #374151; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .feature-icon { font-size: 24px; margin-bottom: 10px; }
          .feature-title { font-size: 16px; font-weight: 600; margin-bottom: 8px; color: #f3f4f6; }
          .feature-desc { font-size: 14px; color: #9ca3af; line-height: 1.5; }
          .cta-button { display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; margin: 20px 0; text-align: center; }
          .creators-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; margin: 20px 0; }
          .creator-card { background: #1f1f1f; border: 1px solid #374151; border-radius: 8px; padding: 15px; text-align: center; }
          .creator-avatar { width: 50px; height: 50px; border-radius: 50%; margin: 0 auto 10px; display: flex; align-items: center; justify-center; font-weight: bold; color: white; }
          .footer { text-align: center; padding: 30px 0; border-top: 1px solid #374151; margin-top: 40px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🎵 AuditoryX</div>
            <div class="hero-text">Welcome to the Global Creative Network</div>
          </div>
          
          <div class="content">
            <h1 style="color: #f3f4f6; font-size: 24px; margin-bottom: 20px;">
              ${data.name ? `Hey ${data.name}!` : 'Hey there!'} 👋
            </h1>
            
            <p style="font-size: 16px; line-height: 1.6; color: #d1d5db; margin-bottom: 25px;">
              Welcome to AuditoryX! You've just joined the world's most vibrant network of music creators, 
              from Grammy-winning producers to emerging artists breaking new ground.
            </p>

            <div class="feature">
              <div class="feature-icon">🔥</div>
              <div class="feature-title">Exclusive Early Access</div>
              <div class="feature-desc">
                You're among the first to discover new creators before they blow up. Get first dibs on collaborations and exclusive pricing.
              </div>
            </div>

            <div class="feature">
              <div class="feature-icon">💎</div>
              <div class="feature-title">Curated Weekly Drops</div>
              <div class="feature-desc">
                Every Tuesday, we'll send you hand-picked creators, trending sounds, and exclusive collaboration opportunities matched to your vibe.
              </div>
            </div>

            <div class="feature">
              <div class="feature-icon">🎯</div>
              <div class="feature-title">Personalized Recommendations</div>
              <div class="feature-desc">
                Our AI learns your taste and connects you with creators who match your style. The more you explore, the better it gets.
              </div>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${baseUrl}/explore?utm_source=welcome_email&utm_medium=email&utm_campaign=onboarding" class="cta-button">
                🚀 Start Exploring Creators
              </a>
            </div>

            <h2 style="color: #f3f4f6; font-size: 20px; margin: 30px 0 20px;">Featured This Week</h2>
            
            <div class="creators-grid">
              <div class="creator-card">
                <div class="creator-avatar" style="background: linear-gradient(135deg, #8b5cf6, #ec4899);">OM</div>
                <div style="font-weight: 600; margin-bottom: 5px;">Oogie Mane</div>
                <div style="font-size: 12px; color: #9ca3af;">Producer • Atlanta</div>
                <div style="font-size: 12px; color: #10b981; margin-top: 5px;">⭐ 4.9 • From $500</div>
              </div>
              
              <div class="creator-card">
                <div class="creator-avatar" style="background: linear-gradient(135deg, #f59e0b, #ef4444);">CB</div>
                <div style="font-weight: 600; margin-bottom: 5px;">Cole Bennett</div>
                <div style="font-size: 12px; color: #9ca3af;">Director • Chicago</div>
                <div style="font-size: 12px; color: #10b981; margin-top: 5px;">⭐ 5.0 • From $5K</div>
              </div>
            </div>

            <div style="background: #1f2937; border-left: 4px solid #6366f1; padding: 20px; margin: 30px 0; border-radius: 0 8px 8px 0;">
              <p style="margin: 0; font-size: 14px; color: #d1d5db;">
                <strong>💡 Pro Tip:</strong> The best collaborations happen when you reach out first. 
                Don't wait - your next hit could be one message away.
              </p>
            </div>

            <p style="font-size: 14px; color: #9ca3af; line-height: 1.6;">
              Questions? Just reply to this email - we're here to help you navigate the platform and make those creative connections happen.
            </p>

            <p style="font-size: 14px; color: #d1d5db; margin-top: 20px;">
              Keep creating,<br>
              <strong>The AuditoryX Team</strong> 🎵
            </p>
          </div>

          <div class="footer">
            <p>You're receiving this because you signed up for early access to AuditoryX.</p>
            <p>
              <a href="${baseUrl}/unsubscribe" style="color: #6b7280;">Unsubscribe</a> | 
              <a href="${baseUrl}" style="color: #6b7280;">Visit AuditoryX</a>
            </p>
            <p>AuditoryX Inc. • Global Creative Network • Built for Music</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Welcome to AuditoryX! 🎵

${data.name ? `Hey ${data.name}!` : 'Hey there!'} 

You've just joined the world's most vibrant network of music creators, from Grammy-winning producers to emerging artists breaking new ground.

🔥 EXCLUSIVE EARLY ACCESS
You're among the first to discover new creators before they blow up. Get first dibs on collaborations and exclusive pricing.

💎 CURATED WEEKLY DROPS  
Every Tuesday, we'll send you hand-picked creators, trending sounds, and exclusive collaboration opportunities matched to your vibe.

🎯 PERSONALIZED RECOMMENDATIONS
Our AI learns your taste and connects you with creators who match your style. The more you explore, the better it gets.

Start exploring: ${baseUrl}/explore

Featured This Week:
• Oogie Mane - Producer, Atlanta (⭐ 4.9, From $500)
• Cole Bennett - Director, Chicago (⭐ 5.0, From $5K)

💡 Pro Tip: The best collaborations happen when you reach out first. Don't wait - your next hit could be one message away.

Questions? Just reply to this email - we're here to help!

Keep creating,
The AuditoryX Team 🎵

---
You're receiving this because you signed up for early access to AuditoryX.
Unsubscribe: ${baseUrl}/unsubscribe | Visit: ${baseUrl}
    `,
  };
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, source, name } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }

    const db = getFirestore(app);
    
    // Generate email content
    const emailTemplate = getWelcomeEmailTemplate({ email, source, name });
    
    // Save email to queue for sending
    const emailQueueRef = doc(db, 'email_queue', `welcome_${email.replace('@', '_at_')}_${Date.now()}`);
    await setDoc(emailQueueRef, {
      to: email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text,
      type: 'welcome',
      source,
      status: 'pending',
      createdAt: serverTimestamp(),
      attempts: 0,
    });

    // Here you would typically integrate with your email service:
    // - SendGrid
    // - Mailgun  
    // - AWS SES
    // - Postmark
    // - etc.

    // For development, we'll just log it
    console.log('Welcome email queued for:', email.substring(0, 3) + '***');

    return NextResponse.json({
      success: true,
      message: 'Welcome email queued successfully',
    });

  } catch (error) {
    console.error('Welcome email error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send welcome email' },
      { status: 500 }
    );
  }
}
