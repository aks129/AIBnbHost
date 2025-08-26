interface EmailNotificationData {
  email: string;
  name?: string;
  source: string;
  timestamp: string;
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

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}