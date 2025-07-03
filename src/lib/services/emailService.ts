// Email service integration for AuditoryX
// Supports multiple providers: ConvertKit, Mailchimp, Custom API

export interface EmailCaptureData {
  email: string;
  source: 'homepage' | 'explore' | 'profile' | 'booking_attempt' | 'contact_attempt';
  metadata?: {
    profileViewed?: number;
    searchPerformed?: number;
    lastCreatorViewed?: string;
    userAgent?: string;
    timestamp?: string;
  };
}

export interface EmailProvider {
  captureEmail(data: EmailCaptureData): Promise<{ success: boolean; message?: string }>;
  subscribeToNewsletter(email: string, tags?: string[]): Promise<{ success: boolean; message?: string }>;
}

// ConvertKit implementation
class ConvertKitProvider implements EmailProvider {
  private apiKey: string;
  private formId: string;

  constructor(apiKey: string, formId: string) {
    this.apiKey = apiKey;
    this.formId = formId;
  }

  async captureEmail(data: EmailCaptureData): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(`https://api.convertkit.com/v3/forms/${this.formId}/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: this.apiKey,
          email: data.email,
          tags: [data.source, 'progressive_onboarding'],
          fields: {
            source: data.source,
            profile_views: data.metadata?.profileViewed || 0,
            searches: data.metadata?.searchPerformed || 0,
            last_creator: data.metadata?.lastCreatorViewed || '',
            timestamp: data.metadata?.timestamp || new Date().toISOString(),
          },
        }),
      });

      const result = await response.json();
      
      if (response.ok) {
        return { success: true, message: 'Successfully subscribed to ConvertKit' };
      } else {
        console.error('ConvertKit error:', result);
        return { success: false, message: result.message || 'Failed to subscribe' };
      }
    } catch (error) {
      console.error('ConvertKit API error:', error);
      return { success: false, message: 'Network error' };
    }
  }

  async subscribeToNewsletter(email: string, tags: string[] = []): Promise<{ success: boolean; message?: string }> {
    return this.captureEmail({
      email,
      source: 'homepage',
      metadata: { timestamp: new Date().toISOString() }
    });
  }
}

// Mailchimp implementation
class MailchimpProvider implements EmailProvider {
  private apiKey: string;
  private listId: string;
  private serverPrefix: string;

  constructor(apiKey: string, listId: string) {
    this.apiKey = apiKey;
    this.listId = listId;
    this.serverPrefix = apiKey.split('-')[1];
  }

  async captureEmail(data: EmailCaptureData): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(
        `https://${this.serverPrefix}.api.mailchimp.com/3.0/lists/${this.listId}/members`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            email_address: data.email,
            status: 'subscribed',
            tags: [data.source, 'progressive_onboarding'],
            merge_fields: {
              SOURCE: data.source,
              PROFILES: data.metadata?.profileViewed || 0,
              SEARCHES: data.metadata?.searchPerformed || 0,
              CREATOR: data.metadata?.lastCreatorViewed || '',
              TIMESTAMP: data.metadata?.timestamp || new Date().toISOString(),
            },
          }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        return { success: true, message: 'Successfully subscribed to Mailchimp' };
      } else {
        console.error('Mailchimp error:', result);
        return { success: false, message: result.title || 'Failed to subscribe' };
      }
    } catch (error) {
      console.error('Mailchimp API error:', error);
      return { success: false, message: 'Network error' };
    }
  }

  async subscribeToNewsletter(email: string, tags: string[] = []): Promise<{ success: boolean; message?: string }> {
    return this.captureEmail({
      email,
      source: 'homepage',
      metadata: { timestamp: new Date().toISOString() }
    });
  }
}

// Custom API implementation (for your own backend)
class CustomProvider implements EmailProvider {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async captureEmail(data: EmailCaptureData): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/email/capture`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        return { success: true, message: 'Email captured successfully' };
      } else {
        console.error('Custom API error:', result);
        return { success: false, message: result.message || 'Failed to capture email' };
      }
    } catch (error) {
      console.error('Custom API error:', error);
      return { success: false, message: 'Network error' };
    }
  }

  async subscribeToNewsletter(email: string, tags: string[] = []): Promise<{ success: boolean; message?: string }> {
    return this.captureEmail({
      email,
      source: 'homepage',
      metadata: { timestamp: new Date().toISOString() }
    });
  }
}

// Email service factory
export class EmailService {
  private provider: EmailProvider;

  constructor() {
    const providerType = process.env.NEXT_PUBLIC_EMAIL_PROVIDER || 'custom';
    
    switch (providerType.toLowerCase()) {
      case 'convertkit':
        this.provider = new ConvertKitProvider(
          process.env.CONVERTKIT_API_KEY!,
          process.env.CONVERTKIT_FORM_ID!
        );
        break;
      case 'mailchimp':
        this.provider = new MailchimpProvider(
          process.env.MAILCHIMP_API_KEY!,
          process.env.MAILCHIMP_LIST_ID!
        );
        break;
      default:
        this.provider = new CustomProvider(
          process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
        );
    }
  }

  async captureEmail(data: EmailCaptureData): Promise<{ success: boolean; message?: string }> {
    // Add client-side metadata
    const enhancedData = {
      ...data,
      metadata: {
        ...data.metadata,
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
        timestamp: new Date().toISOString(),
      },
    };

    return this.provider.captureEmail(enhancedData);
  }

  async subscribeToNewsletter(email: string, tags: string[] = []): Promise<{ success: boolean; message?: string }> {
    return this.provider.subscribeToNewsletter(email, tags);
  }
}

// Singleton instance
export const emailService = new EmailService();
