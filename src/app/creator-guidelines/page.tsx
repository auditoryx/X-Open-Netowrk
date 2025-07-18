import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Creator Guidelines - AuditoryX',
  description: 'Guidelines and standards for creators on AuditoryX platform',
};

export default function CreatorGuidelinesPage() {
  return (
    <div className="min-h-screen bg-ebony text-gray-100">
      <div className="container mx-auto py-12 px-6 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">
          Creator Guidelines
        </h1>
        
        <div className="prose prose-invert prose-lg max-w-none">
          <p className="text-gray-400 mb-8">
            Everything you need to know about becoming and succeeding as a creator on AuditoryX
          </p>

          <div className="space-y-8">
            <section className="bg-brand-900/20 p-6 rounded-xl border border-brand-500/20">
              <h2 className="text-2xl font-semibold mb-4 text-white">🎯 Our Mission</h2>
              <p className="text-gray-300 leading-relaxed">
                AuditoryX exists to empower music industry professionals by providing a trusted platform for collaboration, fair compensation, and career growth. We maintain high standards to ensure quality experiences for both creators and clients.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">📝 Application Process</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Step 1: Choose Your Role</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-panel p-4 rounded-lg">
                      <h4 className="font-semibold text-white mb-2">🎤 Artist</h4>
                      <p className="text-sm text-gray-400">Rappers, singers, songwriters, and performers</p>
                    </div>
                    <div className="bg-panel p-4 rounded-lg">
                      <h4 className="font-semibold text-white mb-2">🎧 Producer</h4>
                      <p className="text-sm text-gray-400">Beatmakers, composers, and music producers</p>
                    </div>
                    <div className="bg-panel p-4 rounded-lg">
                      <h4 className="font-semibold text-white mb-2">🎚️ Engineer</h4>
                      <p className="text-sm text-gray-400">Mixing, mastering, and audio engineers</p>
                    </div>
                    <div className="bg-panel p-4 rounded-lg">
                      <h4 className="font-semibold text-white mb-2">🎥 Videographer</h4>
                      <p className="text-sm text-gray-400">Music video directors and visual creators</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Step 2: Required Documentation</h3>
                  <ul className="text-gray-300 space-y-2 ml-6">
                    <li>• Professional portfolio with 3-5 best work samples</li>
                    <li>• Valid government-issued ID for verification</li>
                    <li>• Business registration (if applicable)</li>
                    <li>• Client references or testimonials</li>
                    <li>• Tax information for payment processing</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Step 3: Review Process</h3>
                  <div className="bg-neutral-900 p-4 rounded-lg">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Application Submitted</span>
                      <span className="text-gray-400">→</span>
                      <span className="text-gray-400">Initial Review (2-3 days)</span>
                      <span className="text-gray-400">→</span>
                      <span className="text-gray-400">Quality Assessment</span>
                      <span className="text-gray-400">→</span>
                      <span className="text-brand-400">Approval/Feedback</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">⭐ Quality Standards</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Professional Excellence</h3>
                  <ul className="text-gray-300 space-y-2 ml-6">
                    <li>• Demonstrate industry-standard technical skills</li>
                    <li>• Maintain consistent quality across all deliverables</li>
                    <li>• Showcase unique style and creative vision</li>
                    <li>• Provide clear, professional communication</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Portfolio Requirements</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-white">Audio Quality Standards:</h4>
                      <ul className="text-gray-300 text-sm space-y-1 ml-4">
                        <li>• Professional recording quality</li>
                        <li>• Proper mixing and mastering</li>
                        <li>• Clear, distortion-free audio</li>
                        <li>• Industry-standard file formats</li>
                      </ul>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-semibold text-white">Video Quality Standards:</h4>
                      <ul className="text-gray-300 text-sm space-y-1 ml-4">
                        <li>• Minimum 1080p resolution</li>
                        <li>• Professional color grading</li>
                        <li>• Smooth, stable footage</li>
                        <li>• Creative visual storytelling</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">💼 Professional Conduct</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-green-900/20 p-6 rounded-lg border border-green-500/20">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                    ✅ Best Practices
                  </h3>
                  <ul className="text-gray-300 space-y-2 text-sm">
                    <li>• Respond to messages within 24 hours</li>
                    <li>• Meet all agreed deadlines</li>
                    <li>• Communicate any issues early</li>
                    <li>• Deliver work as specified</li>
                    <li>• Be respectful and professional</li>
                    <li>• Honor quoted prices and terms</li>
                  </ul>
                </div>
                
                <div className="bg-red-900/20 p-6 rounded-lg border border-red-500/20">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                    ❌ Prohibited Actions
                  </h3>
                  <ul className="text-gray-300 space-y-2 text-sm">
                    <li>• Taking payments outside the platform</li>
                    <li>• Sharing contact info prematurely</li>
                    <li>• Misrepresenting skills or experience</li>
                    <li>• Using copyrighted material without permission</li>
                    <li>• Discriminating against clients</li>
                    <li>• Creating fake reviews or accounts</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">💰 Pricing and Services</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Pricing Guidelines</h3>
                  <div className="bg-panel p-6 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-white mb-2">Suggested Price Ranges:</h4>
                        <ul className="text-gray-300 text-sm space-y-1">
                          <li>• Artist Features: $500 - $5,000</li>
                          <li>• Beat Production: $100 - $2,000</li>
                          <li>• Mixing/Mastering: $200 - $1,500</li>
                          <li>• Music Videos: $1,000 - $10,000</li>
                          <li>• Studio Time: $50 - $300/hour</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-white mb-2">Pricing Tips:</h4>
                        <ul className="text-gray-300 text-sm space-y-1">
                          <li>• Research market rates</li>
                          <li>• Factor in your experience level</li>
                          <li>• Include revisions in base price</li>
                          <li>• Offer package deals for value</li>
                          <li>• Be transparent about add-ons</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Service Descriptions</h3>
                  <p className="text-gray-300 mb-4">Your service descriptions should be:</p>
                  <ul className="text-gray-300 space-y-2 ml-6">
                    <li>• Clear and detailed about what's included</li>
                    <li>• Honest about turnaround times</li>
                    <li>• Specific about deliverables and formats</li>
                    <li>• Upfront about any additional costs</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">🏆 Success Tips</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-panel p-6 rounded-lg">
                  <div className="text-2xl mb-3">📈</div>
                  <h3 className="font-semibold text-white mb-2">Build Your Reputation</h3>
                  <p className="text-gray-400 text-sm">
                    Complete projects on time, exceed expectations, and gather positive reviews to boost your ranking.
                  </p>
                </div>
                
                <div className="bg-panel p-6 rounded-lg">
                  <div className="text-2xl mb-3">🎨</div>
                  <h3 className="font-semibold text-white mb-2">Showcase Your Best</h3>
                  <p className="text-gray-400 text-sm">
                    Regularly update your portfolio with your latest and greatest work to attract premium clients.
                  </p>
                </div>
                
                <div className="bg-panel p-6 rounded-lg">
                  <div className="text-2xl mb-3">🤝</div>
                  <h3 className="font-semibold text-white mb-2">Network & Collaborate</h3>
                  <p className="text-gray-400 text-sm">
                    Build relationships with other creators and clients for recurring work and referrals.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">📞 Support & Resources</h2>
              
              <div className="bg-panel p-6 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-white mb-3">Need Help?</h3>
                    <ul className="text-gray-300 space-y-2 text-sm">
                      <li>• <a href="/contact" className="text-brand-400 hover:text-brand-300">Contact Support</a></li>
                      <li>• Creator Community Discord</li>
                      <li>• Video Tutorials</li>
                      <li>• Best Practices Guide</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-white mb-3">Resources</h3>
                    <ul className="text-gray-300 space-y-2 text-sm">
                      <li>• Platform Feature Updates</li>
                      <li>• Industry News & Trends</li>
                      <li>• Success Stories</li>
                      <li>• Creator Spotlights</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="mt-12 p-6 bg-brand-900/20 rounded-xl border border-brand-500/20">
            <h3 className="text-lg font-semibold text-white mb-2">
              Ready to Apply?
            </h3>
            <p className="text-gray-400 mb-4">
              Join thousands of creators earning on AuditoryX. Start your application today.
            </p>
            <a 
              href="/apply" 
              className="inline-block bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-lg transition-colors font-semibold"
            >
              Apply as Creator
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}