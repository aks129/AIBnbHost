interface EmailNotificationData {
  email: string;
  name?: string;
  source: string;
  timestamp: string;
}

interface DemoInterestData {
  email?: string;
  name?: string;
  source: string;
  timestamp: string;
  userAgent?: string;
}

export async function sendSignupNotification(signupData: EmailNotificationData): Promise<void> {
  const notificationEmail = "eugenevestel@gmail.com";
  const subject = "New Lana AI Airbnb Co-Host Signup";
  
  const emailBody = `
New signup for Lana AI Airbnb Co-Host:

Name: ${signupData.name || 'Not provided'}
Email: ${signupData.email}
Source: ${signupData.source}
Timestamp: ${signupData.timestamp}

You can follow up with this lead directly.
  `.trim();

  // In a real implementation, you would use a service like SendGrid, Mailgun, or AWS SES
  // For now, we'll log the notification
  console.log(`📧 EMAIL NOTIFICATION TO: ${notificationEmail}`);
  console.log(`📧 SUBJECT: ${subject}`);
  console.log(`📧 BODY: ${emailBody}`);
  
  // Simulate email sending success
  return Promise.resolve();
}

export async function sendDemoInterestNotification(interestData: DemoInterestData): Promise<void> {
  const notificationEmail = "eugenevestel@gmail.com";
  const subject = "New Demo Interest - Lana AI Airbnb Co-Host";
  
  const emailBody = `
New demo interest for Lana AI Airbnb Co-Host:

Contact Info: ${interestData.email || 'Not provided'}
Name: ${interestData.name || 'Not provided'}
Source: ${interestData.source}
Timestamp: ${interestData.timestamp}
User Agent: ${interestData.userAgent || 'Not available'}

A potential customer has shown interest in scheduling a demo. 
Follow up with them if they provided contact information.
  `.trim();

  // In a real implementation, you would use a service like SendGrid, Mailgun, or AWS SES
  console.log(`📧 DEMO INTEREST NOTIFICATION TO: ${notificationEmail}`);
  console.log(`📧 SUBJECT: ${subject}`);
  console.log(`📧 BODY: ${emailBody}`);
  
  // Simulate email sending success
  return Promise.resolve();
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}