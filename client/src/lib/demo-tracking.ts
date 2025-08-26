import { apiRequest } from "@/lib/queryClient";

interface DemoInterestData {
  email?: string;
  name?: string;
  source: string;
}

export async function trackDemoInterest(data: DemoInterestData): Promise<void> {
  try {
    await apiRequest("POST", "/api/demo-interest", {
      email: data.email,
      name: data.name,
      source: data.source,
      userAgent: navigator.userAgent
    });
  } catch (error) {
    console.error("Failed to track demo interest:", error);
    // Don't throw error to not interrupt user experience
  }
}

export function openDemoScheduling(source: string, email?: string, name?: string): void {
  // Track the demo interest
  trackDemoInterest({
    email,
    name, 
    source
  });
  
  // Open the Google Calendar link
  window.open("https://calendar.app.google/17Rqf8xXDXpweVPw5", "_blank");
}