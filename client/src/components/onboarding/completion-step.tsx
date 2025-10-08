import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';

interface CompletionStepProps {
  onComplete: () => void;
}

export function CompletionStep({ onComplete }: CompletionStepProps) {
  return (
    <div className="text-center py-8 space-y-6">
      <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
        <CheckCircle2 className="w-12 h-12 text-green-600" />
      </div>

      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">You're All Set!</h3>
        <p className="text-gray-600 max-w-md mx-auto">
          Your AI co-host is ready to help you manage your Airbnb properties and communicate with guests.
        </p>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 max-w-md mx-auto">
        <h4 className="font-semibold text-gray-900 mb-3">What's next?</h4>
        <ul className="text-left space-y-2 text-sm text-gray-700">
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">•</span>
            <span>View your calendar and upcoming reservations</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">•</span>
            <span>Set up automated message templates</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">•</span>
            <span>Monitor guest conversations in real-time</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">•</span>
            <span>Get AI-powered activity recommendations for guests</span>
          </li>
        </ul>
      </div>

      <Button
        onClick={onComplete}
        className="bg-blue-600 hover:bg-blue-700 px-8 py-6 text-lg"
      >
        Go to Dashboard
      </Button>
    </div>
  );
}
