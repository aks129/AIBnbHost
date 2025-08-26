import { Search, CheckCircle, Plane, Key, Heart, Briefcase } from "lucide-react";

export default function WorkflowTimeline() {
  const timelineSteps = [
    {
      icon: Search,
      title: "Pre-Booking Inquiry",
      description: "AI instantly responds to guest questions about amenities, location, and availability with personalized information.",
      example: "Hi! Thanks for your interest in our space. Our loft is perfect for exploring downtown SF...",
      color: "bg-blue-500",
      borderColor: "border-blue-400",
      bgColor: "bg-blue-50",
      side: "left"
    },
    {
      icon: CheckCircle,
      title: "Booking Confirmation", 
      description: "Immediate confirmation with detailed instructions, local recommendations, and everything they need to know.",
      example: "Congratulations! Your booking is confirmed. Here's your personalized guide to the neighborhood...",
      color: "bg-green-500",
      borderColor: "border-green-400", 
      bgColor: "bg-green-50",
      side: "right"
    },
    {
      icon: Plane,
      title: "Pre-Arrival (24-48 hours)",
      description: "Proactive check-in reminders with access codes, WiFi details, and last-minute local tips.",
      example: "Your check-in is tomorrow at 3 PM! Here are your access codes and a weather update...",
      color: "bg-red-500",
      borderColor: "border-red-400",
      bgColor: "bg-red-50", 
      side: "left"
    },
    {
      icon: Key,
      title: "Check-in Day",
      description: "Welcome message with apartment walkthrough, emergency contacts, and immediate area highlights.",
      example: "Welcome to your home in SF! Here's a quick video tour and our top dinner recommendations...",
      color: "bg-teal-600",
      borderColor: "border-teal-400",
      bgColor: "bg-teal-50",
      side: "right"
    },
    {
      icon: Heart,
      title: "During Stay",
      description: "Proactive mid-stay check-ins, problem resolution, and additional recommendations based on their interests.",
      example: "How's your stay going? Since you loved the coffee shop, here are 3 more hidden gems nearby...",
      color: "bg-purple-500",
      borderColor: "border-purple-400",
      bgColor: "bg-purple-50",
      side: "left"
    },
    {
      icon: Briefcase,
      title: "Check-out & Follow-up",
      description: "Check-out reminders, thank you message, and gentle review request with highlights from their stay.",
      example: "Thanks for staying with us! We'd love a review about your favorite part of the experience...",
      color: "bg-yellow-500",
      borderColor: "border-yellow-400",
      bgColor: "bg-yellow-50",
      side: "right"
    }
  ];

  return (
    <section id="workflows" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">AI-Powered Guest Journey</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Lana AI automatically manages every touchpoint of your guest's experience, ensuring consistent, personalized communication.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          <div className="absolute left-1/2 transform -translate-x-px h-full w-0.5 bg-red-500"></div>
          
          {timelineSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative flex items-center justify-between py-8">
                {step.side === "left" ? (
                  <>
                    <div className="w-5/12 text-right pr-8">
                      <div className={`bg-white rounded-xl shadow-lg p-6 border-l-4 ${step.borderColor}`}>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">{step.title}</h3>
                        <p className="text-gray-600 text-sm mb-3">{step.description}</p>
                        <div className={`${step.bgColor} p-3 rounded-lg text-sm`}>
                          <svg className="w-4 h-4 text-gray-400 mb-2" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <p className="italic">"{step.example}"</p>
                        </div>
                      </div>
                    </div>
                    <div className={`absolute left-1/2 transform -translate-x-1/2 w-12 h-12 ${step.color} rounded-full flex items-center justify-center z-10`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="w-5/12"></div>
                  </>
                ) : (
                  <>
                    <div className="w-5/12"></div>
                    <div className={`absolute left-1/2 transform -translate-x-1/2 w-12 h-12 ${step.color} rounded-full flex items-center justify-center z-10`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="w-5/12 pl-8">
                      <div className={`bg-white rounded-xl shadow-lg p-6 border-r-4 ${step.borderColor}`}>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">{step.title}</h3>
                        <p className="text-gray-600 text-sm mb-3">{step.description}</p>
                        <div className={`${step.bgColor} p-3 rounded-lg text-sm`}>
                          <svg className="w-4 h-4 text-gray-400 mb-2" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <p className="italic">"{step.example}"</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
