import { useLocation } from "wouter";
import Navigation from "@/components/navigation";
import HeroSection from "@/components/hero-section";
import StatsSection from "@/components/stats-section";
import DashboardCards from "@/components/dashboard-cards";
import WorkflowTimeline from "@/components/workflow-timeline";
import TemplateLibrary from "@/components/template-library";
import InteractiveDemo from "@/components/interactive-demo";
import AnalyticsSection from "@/components/analytics-section";
import EmailSignup from "@/components/email-signup";
import { openDemoScheduling } from "@/lib/demo-tracking";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <HeroSection />
      <StatsSection />
      <DashboardCards />
      <WorkflowTimeline />
      <TemplateLibrary />
      <InteractiveDemo />
      <AnalyticsSection />
      
      {/* Email Signup Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Join the Revolution</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Be among the first hosts to experience the power of Lana AI. Get early access and transform your Airbnb hosting today.
            </p>
          </div>
          <EmailSignup />
        </div>
      </section>
      
      {/* Call to Action Section */}
      <section className="py-20 gradient-cta">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Hosting?
          </h2>
          <p className="text-xl text-white opacity-90 mb-8">
            Join thousands of hosts who've automated their guest communication and achieved consistently 5-star reviews with Lana AI.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              data-testid="button-start-trial"
              onClick={() => setLocation("/subscribe")}
              className="bg-white text-red-500 px-8 py-4 rounded-xl font-bold text-lg hover:shadow-lg transform hover:-translate-y-1 transition-all"
            >
              Start Free 30-Day Trial
            </button>
            <button 
              data-testid="button-schedule-demo-cta"
              className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-red-500 transition-all"
              onClick={() => openDemoScheduling("cta-section")}
            >
              Schedule Demo Call
            </button>
          </div>
          <p className="text-white opacity-75 mt-6 text-sm">
            No credit card required • Cancel anytime • Setup in under 5 minutes
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-airbnb-dark text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
                </svg>
                <span className="text-xl font-bold">Lana AI Airbnb Co-Host</span>
              </div>
              <p className="text-gray-400">
                Automate your Airbnb guest communication and guarantee 5-star reviews with Lana AI.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Templates</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Analytics</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Docs</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Lana AI Airbnb Co-Host. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
