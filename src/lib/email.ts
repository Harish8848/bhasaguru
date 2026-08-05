import { Resend } from 'resend';

let resendInstance: Resend | null = null;

function getResendClient(): Resend {
  if (!resendInstance) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured');
    }
    resendInstance = new Resend(process.env.RESEND_API_KEY);
  }
  return resendInstance;
}

export async function sendEmail({
  to,
  subject,
  html,
  replyTo,
}: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}) {
  console.log('Attempting to send email:', { to, subject });
  
  try {
    const resend = getResendClient();
    const result = await resend.emails.send({
      from: 'BhasaGuru <onboarding@resend.dev>',
      to: [to],
      subject,
      html,
      replyTo: replyTo,
    });
    
    console.log('Email sent successfully:', result);
    return { success: true, data: result };
  } catch (error: any) {
    console.error('Email send failed:', error);
    return { success: false, error };
  }
}

// Email templates
export const emailTemplates = {
  welcome: (name: string) => `
    <h1>Welcome to BhasaGuru, ${name}!</h1>
    <p>Start your language learning journey today.</p>
    <a href="${process.env.NEXT_PUBLIC_APP_URL}/courses">Browse Courses</a>
  `,

  courseEnrollment: (courseName: string) => `
    <h1>You're enrolled in ${courseName}!</h1>
    <p>Start learning now.</p>
    <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard">Go to Dashboard</a>
  `,
};
