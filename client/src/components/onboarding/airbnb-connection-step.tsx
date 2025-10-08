import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, ExternalLink, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AirbnbConnectionStepProps {
  onNext: () => void;
  onBack: () => void;
}

export function AirbnbConnectionStep({ onNext, onBack }: AirbnbConnectionStepProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      // Request OAuth URL from backend
      const response = await fetch('/api/airbnb/auth/url', {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to get Airbnb authorization URL');
      }

      const { authUrl } = await response.json();

      // Open OAuth popup
      const width = 600;
      const height = 700;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;

      const popup = window.open(
        authUrl,
        'Airbnb Authorization',
        `width=${width},height=${height},left=${left},top=${top}`
      );

      // Listen for OAuth callback
      const handleMessage = async (event: MessageEvent) => {
        if (event.data.type === 'airbnb-oauth-success') {
          popup?.close();
          setIsConnected(true);
          toast({
            title: 'Connected to Airbnb!',
            description: 'Your account has been successfully linked.',
          });
          window.removeEventListener('message', handleMessage);
        } else if (event.data.type === 'airbnb-oauth-error') {
          popup?.close();
          toast({
            title: 'Connection failed',
            description: event.data.error || 'Failed to connect to Airbnb',
            variant: 'destructive',
          });
          window.removeEventListener('message', handleMessage);
        }
      };

      window.addEventListener('message', handleMessage);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to connect',
        variant: 'destructive',
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSkip = () => {
    toast({
      title: 'Airbnb connection skipped',
      description: 'You can connect your Airbnb account later from settings.',
    });
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="text-center py-8">
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
          </svg>
        </div>
        <h3 className="text-xl font-semibold mb-2">Connect Your Airbnb Account</h3>
        <p className="text-gray-600 max-w-md mx-auto">
          Link your Airbnb account to enable automated guest messaging, calendar sync, and AI-powered responses.
        </p>
      </div>

      {isConnected ? (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Your Airbnb account is successfully connected!
          </AlertDescription>
        </Alert>
      ) : (
        <Alert>
          <AlertDescription>
            You'll be redirected to Airbnb to authorize Lana AI. We'll only access information needed to manage your guest communications.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-3">
        {!isConnected ? (
          <Button
            onClick={handleConnect}
            disabled={isConnecting}
            className="w-full bg-red-500 hover:bg-red-600"
          >
            {isConnecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <ExternalLink className="mr-2 h-4 w-4" />
                Connect Airbnb Account
              </>
            )}
          </Button>
        ) : (
          <Button onClick={onNext} className="w-full bg-blue-600 hover:bg-blue-700">
            Continue
          </Button>
        )}

        <div className="flex gap-3">
          <Button onClick={onBack} variant="outline" className="flex-1">
            Back
          </Button>
          {!isConnected && (
            <Button onClick={handleSkip} variant="ghost" className="flex-1">
              Skip for now
            </Button>
          )}
        </div>
      </div>

      <div className="text-xs text-gray-500 text-center space-y-1">
        <p>By connecting, you agree to Lana AI's access to:</p>
        <ul className="list-disc list-inside text-left max-w-md mx-auto">
          <li>Reservation calendar and booking details</li>
          <li>Guest messages and conversation history</li>
          <li>Property listings information</li>
        </ul>
      </div>
    </div>
  );
}
