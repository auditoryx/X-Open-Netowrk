import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service - AuditoryX',
  description: 'Terms of Service for AuditoryX platform',
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-ebony text-gray-100">
      <div className="container mx-auto py-12 px-6 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">
          Terms of Service
        </h1>
        
        <div className="prose prose-invert prose-lg max-w-none">
          <p className="text-gray-400 mb-8">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">1. Acceptance of Terms</h2>
              <p className="text-gray-300 leading-relaxed">
                By accessing and using AuditoryX ("the Platform"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">2. Platform Overview</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                AuditoryX is a creative network platform that connects music industry professionals, including:
              </p>
              <ul className="text-gray-300 space-y-2 ml-6">
                <li>• Artists and performers</li>
                <li>• Music producers and beatmakers</li>
                <li>• Audio engineers and mixing professionals</li>
                <li>• Videographers and creative directors</li>
                <li>• Recording studios and facilities</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">3. User Accounts and Registration</h2>
              <div className="space-y-4 text-gray-300">
                <p>To use AuditoryX services, you must:</p>
                <ul className="ml-6 space-y-2">
                  <li>• Be at least 18 years old or have parental consent</li>
                  <li>• Provide accurate and complete registration information</li>
                  <li>• Maintain the security of your account credentials</li>
                  <li>• Accept responsibility for all activities under your account</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">4. Creator Applications and Verification</h2>
              <div className="space-y-4 text-gray-300">
                <p>Creators wishing to offer services must:</p>
                <ul className="ml-6 space-y-2">
                  <li>• Submit a complete application with required documentation</li>
                  <li>• Undergo our verification process</li>
                  <li>• Maintain professional standards and service quality</li>
                  <li>• Comply with all platform guidelines and policies</li>
                </ul>
                <p>AuditoryX reserves the right to approve or reject applications at our discretion.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibent mb-4 text-white">5. Booking and Payment Terms</h2>
              <div className="space-y-4 text-gray-300">
                <h3 className="text-lg font-semibold text-white">5.1 Booking Process</h3>
                <ul className="ml-6 space-y-2">
                  <li>• All bookings are subject to creator availability and approval</li>
                  <li>• Payment is held in escrow until service completion</li>
                  <li>• Cancellation policies vary by creator and service type</li>
                </ul>
                
                <h3 className="text-lg font-semibold text-white">5.2 Platform Fees</h3>
                <ul className="ml-6 space-y-2">
                  <li>• AuditoryX charges a service fee on completed transactions</li>
                  <li>• Fees are transparently displayed before payment</li>
                  <li>• Payment processing fees may apply</li>
                </ul>

                <h3 className="text-lg font-semibold text-white">5.3 Dispute Resolution</h3>
                <p>In case of disputes, AuditoryX provides mediation services to resolve conflicts fairly.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">6. Intellectual Property</h2>
              <div className="space-y-4 text-gray-300">
                <p>Users retain ownership of their original content and creations. By using the platform, you grant AuditoryX:</p>
                <ul className="ml-6 space-y-2">
                  <li>• Right to display your work for platform promotion</li>
                  <li>• License to use testimonials and reviews</li>
                  <li>• Permission to showcase completed projects (with creator consent)</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">7. Prohibited Activities</h2>
              <div className="space-y-4 text-gray-300">
                <p>Users may not:</p>
                <ul className="ml-6 space-y-2">
                  <li>• Engage in fraudulent or deceptive practices</li>
                  <li>• Circumvent platform payment systems</li>
                  <li>• Share copyrighted material without permission</li>
                  <li>• Harass, threaten, or abuse other users</li>
                  <li>• Use the platform for illegal activities</li>
                  <li>• Create fake accounts or misrepresent identity</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">8. Platform Availability</h2>
              <p className="text-gray-300 leading-relaxed">
                While we strive for 24/7 availability, AuditoryX does not guarantee uninterrupted service. We reserve the right to modify, suspend, or discontinue services with reasonable notice.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">9. Privacy and Data Protection</h2>
              <p className="text-gray-300 leading-relaxed">
                Your privacy is important to us. Please review our Privacy Policy for details on how we collect, use, and protect your personal information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">10. Limitation of Liability</h2>
              <p className="text-gray-300 leading-relaxed">
                AuditoryX acts as a platform connecting creators and clients. We are not responsible for the quality, legality, or outcome of services provided by creators. Our liability is limited to the extent permitted by law.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">11. Changes to Terms</h2>
              <p className="text-gray-300 leading-relaxed">
                We may update these Terms of Service from time to time. Users will be notified of significant changes via email or platform notification. Continued use constitutes acceptance of updated terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">12. Contact Information</h2>
              <div className="text-gray-300 space-y-2">
                <p>For questions about these Terms of Service, contact us at:</p>
                <p>Email: legal@auditoryx.com</p>
                <p>Address: [Company Address]</p>
              </div>
            </section>
          </div>

          <div className="mt-12 p-6 bg-brand-900/20 rounded-xl border border-brand-500/20">
            <h3 className="text-lg font-semibold text-white mb-2">
              Questions about our Terms?
            </h3>
            <p className="text-gray-400 mb-4">
              Our support team is here to help clarify any questions you may have.
            </p>
            <a 
              href="/contact" 
              className="inline-block bg-brand-600 hover:bg-brand-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}