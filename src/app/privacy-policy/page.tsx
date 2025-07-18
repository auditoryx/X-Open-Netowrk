import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - AuditoryX',
  description: 'Privacy Policy for AuditoryX platform',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-ebony text-gray-100">
      <div className="container mx-auto py-12 px-6 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">
          Privacy Policy
        </h1>
        
        <div className="prose prose-invert prose-lg max-w-none">
          <p className="text-gray-400 mb-8">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">1. Information We Collect</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Account Information</h3>
                  <ul className="text-gray-300 space-y-1 ml-6">
                    <li>• Name, email address, and phone number</li>
                    <li>• Profile information and bio</li>
                    <li>• Payment and billing information</li>
                    <li>• Identity verification documents</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Usage Information</h3>
                  <ul className="text-gray-300 space-y-1 ml-6">
                    <li>• Platform interactions and engagement</li>
                    <li>• Search queries and preferences</li>
                    <li>• Booking and transaction history</li>
                    <li>• Communication logs and messages</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Technical Information</h3>
                  <ul className="text-gray-300 space-y-1 ml-6">
                    <li>• IP address and location data</li>
                    <li>• Device and browser information</li>
                    <li>• Cookies and tracking technologies</li>
                    <li>• Performance and analytics data</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">2. How We Use Your Information</h2>
              
              <div className="space-y-4 text-gray-300">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Platform Operations</h3>
                  <ul className="ml-6 space-y-1">
                    <li>• Account creation and management</li>
                    <li>• Service delivery and booking facilitation</li>
                    <li>• Payment processing and financial transactions</li>
                    <li>• Customer support and dispute resolution</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Communication</h3>
                  <ul className="ml-6 space-y-1">
                    <li>• Service notifications and updates</li>
                    <li>• Marketing communications (with consent)</li>
                    <li>• Security alerts and important announcements</li>
                    <li>• Community and support interactions</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Improvement & Analytics</h3>
                  <ul className="ml-6 space-y-1">
                    <li>• Platform performance optimization</li>
                    <li>• User experience enhancement</li>
                    <li>• Security monitoring and fraud prevention</li>
                    <li>• Research and development</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">3. Information Sharing</h2>
              
              <div className="space-y-4 text-gray-300">
                <p>We only share your information in these specific circumstances:</p>
                
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">With Your Consent</h3>
                  <ul className="ml-6 space-y-1">
                    <li>• Profile information visible to other users</li>
                    <li>• Portfolio content for booking purposes</li>
                    <li>• Reviews and testimonials (when provided)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Service Providers</h3>
                  <ul className="ml-6 space-y-1">
                    <li>• Payment processing partners</li>
                    <li>• Cloud storage and hosting services</li>
                    <li>• Analytics and marketing tools</li>
                    <li>• Customer support platforms</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Legal Requirements</h3>
                  <ul className="ml-6 space-y-1">
                    <li>• Compliance with laws and regulations</li>
                    <li>• Response to legal requests</li>
                    <li>• Protection of rights and safety</li>
                    <li>• Fraud prevention and security</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">4. Data Security</h2>
              
              <div className="bg-panel p-6 rounded-lg space-y-4 text-gray-300">
                <p>We implement comprehensive security measures to protect your information:</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-white mb-2">Technical Safeguards</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• End-to-end encryption</li>
                      <li>• Secure data transmission (HTTPS)</li>
                      <li>• Regular security audits</li>
                      <li>• Access controls and monitoring</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-white mb-2">Operational Practices</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Employee background checks</li>
                      <li>• Limited data access on need-to-know basis</li>
                      <li>• Regular training and awareness programs</li>
                      <li>• Incident response procedures</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">5. Your Rights & Choices</h2>
              
              <div className="space-y-4 text-gray-300">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Account Control</h3>
                  <ul className="ml-6 space-y-1">
                    <li>• Access and update your profile information</li>
                    <li>• Download your data</li>
                    <li>• Delete your account</li>
                    <li>• Manage communication preferences</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Privacy Controls</h3>
                  <ul className="ml-6 space-y-1">
                    <li>• Opt out of marketing communications</li>
                    <li>• Control profile visibility settings</li>
                    <li>• Manage cookie preferences</li>
                    <li>• Request data correction or deletion</li>
                  </ul>
                </div>

                <div className="bg-brand-900/20 p-4 rounded-lg border border-brand-500/20">
                  <h4 className="font-semibold text-white mb-2">EU/UK Users (GDPR Rights)</h4>
                  <p className="text-sm">
                    If you're in the EU or UK, you have additional rights including data portability, 
                    the right to erasure, and the right to object to processing. Contact us to exercise these rights.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">6. Data Retention</h2>
              <div className="text-gray-300 space-y-4">
                <p>We retain your information for as long as necessary to:</p>
                <ul className="ml-6 space-y-1">
                  <li>• Provide our services</li>
                  <li>• Comply with legal obligations</li>
                  <li>• Resolve disputes</li>
                  <li>• Enforce our agreements</li>
                </ul>
                
                <p>
                  When you delete your account, we remove or anonymize your personal information, 
                  though some data may be retained for legal or safety purposes.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">7. Cookies & Tracking</h2>
              
              <div className="space-y-4 text-gray-300">
                <p>We use cookies and similar technologies to:</p>
                <ul className="ml-6 space-y-1">
                  <li>• Remember your preferences</li>
                  <li>• Analyze platform usage</li>
                  <li>• Provide personalized experiences</li>
                  <li>• Ensure security and prevent fraud</li>
                </ul>
                
                <p>
                  You can control cookie settings through your browser preferences. 
                  Note that disabling cookies may affect platform functionality.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">8. International Transfers</h2>
              <p className="text-gray-300 leading-relaxed">
                AuditoryX operates globally. Your information may be transferred to and processed in 
                countries outside your residence. We implement appropriate safeguards to ensure your 
                data receives adequate protection wherever it's processed.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">9. Children's Privacy</h2>
              <p className="text-gray-300 leading-relaxed">
                AuditoryX is not intended for users under 18. We do not knowingly collect personal 
                information from children. If you believe we have inadvertently collected such 
                information, please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">10. Changes to This Policy</h2>
              <p className="text-gray-300 leading-relaxed">
                We may update this Privacy Policy periodically. We'll notify you of significant 
                changes via email or platform notification. Your continued use of AuditoryX after 
                changes take effect constitutes acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">11. Contact Us</h2>
              <div className="text-gray-300 space-y-2">
                <p>For privacy-related questions or concerns, contact us at:</p>
                <div className="bg-panel p-4 rounded-lg">
                  <p><strong>Email:</strong> privacy@auditoryx.com</p>
                  <p><strong>Data Protection Officer:</strong> dpo@auditoryx.com</p>
                  <p><strong>Address:</strong> [Company Address]</p>
                </div>
              </div>
            </section>
          </div>

          <div className="mt-12 p-6 bg-brand-900/20 rounded-xl border border-brand-500/20">
            <h3 className="text-lg font-semibold text-white mb-2">
              Questions about our Privacy Policy?
            </h3>
            <p className="text-gray-400 mb-4">
              Our privacy team is here to help address any concerns you may have.
            </p>
            <a 
              href="/contact" 
              className="inline-block bg-brand-600 hover:bg-brand-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Contact Privacy Team
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}