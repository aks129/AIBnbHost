import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Sparkles, Coffee, Utensils, Landmark, Mountain, Heart, RefreshCw } from 'lucide-react';
import Navigation from '@/components/navigation';

interface Activity {
  id: string;
  title: string;
  description: string;
  category: string;
  location?: string;
}

const categoryIcons: Record<string, any> = {
  'dining': Utensils,
  'attractions': Landmark,
  'outdoor': Mountain,
  'coffee': Coffee,
  'culture': Heart,
  'default': MapPin,
};

const categoryColors: Record<string, string> = {
  'dining': 'bg-orange-100 text-orange-800',
  'attractions': 'bg-blue-100 text-blue-800',
  'outdoor': 'bg-green-100 text-green-800',
  'coffee': 'bg-amber-100 text-amber-800',
  'culture': 'bg-purple-100 text-purple-800',
  'default': 'bg-gray-100 text-gray-800',
};

export default function ActivitiesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [location, setLocation] = useState('');
  const [preferences, setPreferences] = useState('');

  const { data: activities = [], isLoading } = useQuery<Activity[]>({
    queryKey: ['/api/activities'],
  });

  const generateMutation = useMutation({
    mutationFn: async (data: { location: string; preferences?: string }) => {
      const response = await fetch('/api/activities/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to generate activities');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/activities'] });
      toast({ title: 'Activities generated!', description: 'New recommendations are ready' });
      setLocation('');
      setPreferences('');
    },
    onError: () => {
      toast({
        title: 'Failed to generate activities',
        description: 'Please try again',
        variant: 'destructive',
      });
    },
  });

  const handleGenerate = () => {
    if (!location.trim()) {
      toast({
        title: 'Location required',
        description: 'Please enter a location',
        variant: 'destructive',
      });
      return;
    }
    generateMutation.mutate({ location, preferences });
  };

  const getCategoryIcon = (category: string) => {
    const key = category.toLowerCase();
    return categoryIcons[key] || categoryIcons.default;
  };

  const getCategoryColor = (category: string) => {
    const key = category.toLowerCase();
    return categoryColors[key] || categoryColors.default;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Activity Recommendations</h1>
          <p className="text-gray-600">AI-powered local recommendations for your guests</p>
        </div>

        {/* Generate Activities */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              Generate Recommendations
            </CardTitle>
            <CardDescription>
              Use AI to generate personalized activity recommendations for any location
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Location</label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., San Francisco, CA"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Guest Preferences (optional)
              </label>
              <Textarea
                value={preferences}
                onChange={(e) => setPreferences(e.target.value)}
                placeholder="e.g., Family-friendly, outdoor activities, budget-conscious"
                rows={3}
              />
            </div>
            <Button
              onClick={handleGenerate}
              disabled={generateMutation.isPending}
              className="w-full"
            >
              {generateMutation.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Activities
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Activities Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">Loading activities...</p>
          </div>
        ) : activities.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <MapPin className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">No activities yet</h3>
              <p className="text-gray-600 mb-6">
                Generate AI-powered recommendations to get started
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                Recommendations ({activities.length})
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activities.map((activity) => {
                const Icon = getCategoryIcon(activity.category);
                return (
                  <Card key={activity.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-2">{activity.title}</CardTitle>
                          <Badge className={getCategoryColor(activity.category)}>
                            <Icon className="h-3 w-3 mr-1" />
                            {activity.category}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-700 mb-4">{activity.description}</p>
                      {activity.location && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <MapPin className="h-4 w-4" />
                          {activity.location}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        )}

        {/* Info Card */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="bg-blue-100 rounded-full p-3">
                <Sparkles className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">
                  How Activity Recommendations Work
                </h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• AI analyzes the location and guest preferences</li>
                  <li>• Generates diverse recommendations (dining, attractions, activities)</li>
                  <li>• Includes local hidden gems and popular spots</li>
                  <li>• Share these with guests via automated messages or manual replies</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
