import { createJob } from '../../../../framework/queue';

export interface EmailPayload {
  to: string;
  subject: string;
  body: string;
}

export const SendWelcomeEmail = createJob<EmailPayload>('send-welcome-email', async (data) => {
  // Simulate email sending
  console.log(`Sending welcome email to ${data.to}`);
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log(`Email sent to ${data.to}`);
});
