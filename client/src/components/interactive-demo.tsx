import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bot, Send, Edit, RotateCcw, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface GenerateMessageResponse {
  message: string;
  generatedAt: string;
  model: string;
}

export default function InteractiveDemo() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    guestType: "first-time",
    communicationStage: "pre-arrival",
    specialContext: "",
    tone: "friendly",
    guestName: "Sarah"
  });
  
  const [generatedMessage, setGeneratedMessage] = useState("");

  const generateMessage = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await apiRequest("POST", "/api/messages/generate", {
        guestType: data.guestType,
        communicationStage: data.communicationStage,
        specialContext: data.specialContext,
        tone: data.tone,
        guestName: data.guestName
      });
      return response.json() as Promise<GenerateMessageResponse>;
    },
    onSuccess: (data) => {
      setGeneratedMessage(data.message);
      toast({
        title: "Message Generated!",
        description: "Claude AI has created your personalized guest message.",
      });
    },
    onError: (error) => {
      toast({
        title: "Generation Failed", 
        description: error instanceof Error ? error.message : "Failed to generate message",
        variant: "destructive",
      });
    }
  });

  const handleGenerate = () => {
    if (!formData.guestName.trim()) {
      toast({
        title: "Guest Name Required",
        description: "Please enter a guest name to generate a personalized message.",
        variant: "destructive",
      });
      return;
    }
    generateMessage.mutate(formData);
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">See Lana AI in Action</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience how Lana AI crafts personalized messages in real-time based on guest profiles, timing, and context.
          </p>
        </div>

        <div className="bg-gray-100 rounded-2xl p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Panel */}
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-6">Guest Profile & Context</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="guest-name" className="text-sm font-medium text-gray-700 mb-2">
                      Guest Name
                    </Label>
                    <Input
                      id="guest-name"
                      data-testid="input-guest-name"
                      value={formData.guestName}
                      onChange={(e) => handleFormChange("guestName", e.target.value)}
                      placeholder="e.g., Sarah, Mike, Emma"
                      className="w-full"
                    />
                  </div>

                  <div>
                    <Label htmlFor="guest-type" className="text-sm font-medium text-gray-700 mb-2">
                      Guest Type
                    </Label>
                    <Select
                      value={formData.guestType}
                      onValueChange={(value) => handleFormChange("guestType", value)}
                    >
                      <SelectTrigger data-testid="select-guest-type" className="w-full">
                        <SelectValue placeholder="Select guest type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="first-time">First-time visitor</SelectItem>
                        <SelectItem value="business">Business traveler</SelectItem>
                        <SelectItem value="family">Family with kids</SelectItem>
                        <SelectItem value="couple">Couple on romantic getaway</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="communication-stage" className="text-sm font-medium text-gray-700 mb-2">
                      Communication Stage
                    </Label>
                    <Select
                      value={formData.communicationStage}
                      onValueChange={(value) => handleFormChange("communicationStage", value)}
                    >
                      <SelectTrigger data-testid="select-communication-stage" className="w-full">
                        <SelectValue placeholder="Select stage" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pre-arrival">Pre-arrival (24h)</SelectItem>
                        <SelectItem value="welcome">Welcome message</SelectItem>
                        <SelectItem value="mid-stay">Mid-stay check-in</SelectItem>
                        <SelectItem value="checkout">Check-out reminder</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="special-context" className="text-sm font-medium text-gray-700 mb-2">
                      Special Context
                    </Label>
                    <Input
                      id="special-context"
                      data-testid="input-special-context"
                      value={formData.specialContext}
                      onChange={(e) => handleFormChange("specialContext", e.target.value)}
                      placeholder="e.g., rainy weather, local festival, weekend"
                      className="w-full"
                    />
                  </div>

                  <div>
                    <Label htmlFor="tone" className="text-sm font-medium text-gray-700 mb-2">
                      Tone
                    </Label>
                    <Select
                      value={formData.tone}
                      onValueChange={(value) => handleFormChange("tone", value)}
                    >
                      <SelectTrigger data-testid="select-tone" className="w-full">
                        <SelectValue placeholder="Select tone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="friendly">Friendly & enthusiastic</SelectItem>
                        <SelectItem value="professional">Professional & helpful</SelectItem>
                        <SelectItem value="warm">Warm & personal</SelectItem>
                        <SelectItem value="casual">Casual & fun</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    data-testid="button-generate-message"
                    onClick={handleGenerate}
                    disabled={generateMessage.isPending}
                    className="w-full bg-red-500 text-white hover:bg-red-600 transition-colors"
                  >
                    <Bot className="w-4 h-4 mr-2" />
                    {generateMessage.isPending ? "Generating..." : "Generate Message with Lana AI"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Output Panel */}
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-6">AI-Generated Message</h3>
                <div className="bg-gray-50 rounded-lg p-4 min-h-64">
                  {generateMessage.isPending ? (
                    <div className="flex items-center justify-center h-64">
                      <div className="text-center">
                        <Bot className="w-8 h-8 text-red-500 animate-pulse mx-auto mb-2" />
                        <p className="text-gray-600">Lana AI is crafting your message...</p>
                      </div>
                    </div>
                  ) : generatedMessage ? (
                    <>
                      <div className="flex items-start space-x-3 mb-4">
                        <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="bg-white rounded-lg p-4 shadow-sm">
                            <div className="text-gray-800 whitespace-pre-wrap" data-testid="generated-message">
                              {generatedMessage}
                            </div>
                          </div>
                          <div className="text-xs text-gray-600 mt-2 flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            Generated with Lana AI
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          data-testid="button-send-message"
                          size="sm"
                          className="bg-green-100 text-green-800 hover:bg-green-200 transition-colors"
                        >
                          <Send className="w-3 h-3 mr-1" />
                          Send Message
                        </Button>
                        <Button
                          data-testid="button-edit-message" 
                          size="sm"
                          variant="outline"
                          className="bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          data-testid="button-regenerate-message"
                          size="sm"
                          variant="outline"
                          onClick={handleGenerate}
                          disabled={generateMessage.isPending}
                          className="bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors"
                        >
                          <RotateCcw className="w-3 h-3 mr-1" />
                          Regenerate
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-64 text-gray-500">
                      <div className="text-center">
                        <Bot className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p>Click "Generate Message" to see Lana AI in action</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
