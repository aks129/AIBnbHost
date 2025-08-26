import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  return (
    <section className="gradient-hero py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center text-white">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Guarantee 5-Star Reviews<br />
            <span className="text-yellow-300">with AI-Powered Communication</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
            Let Claude AI automate your entire Airbnb guest journey - from pre-arrival messages to post-stay follow-ups. 
            Delight every guest with personalized, timely communication.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              data-testid="button-watch-demo"
              className="bg-white text-red-500 px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-lg transform hover:-translate-y-1 transition-all"
            >
              <Play className="w-5 h-5 mr-2" />
              Watch Demo
            </Button>
            <Button 
              data-testid="button-start-free-trial"
              variant="outline"
              className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-red-500 transition-all bg-transparent"
            >
              Start Free Trial
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
