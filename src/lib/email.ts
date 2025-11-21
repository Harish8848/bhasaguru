import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  try {
    await resend.emails.send({
      from: 'BhasaGuru <noreply@bhasaguru.com>',
      to,
      subject,
      html,
    });
    return { success: true };
  } catch (error) {
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

  testComplete: (testName: string, score: number, passed: boolean) => `
    <h1>Test Results: ${testName}</h1>
    <p>Your score: ${score}%</p>
    <p>Status: ${passed ? 'Passed ✅' : 'Not Passed ❌'}</p>
    <a href="${process.env.NEXT_PUBLIC_APP_URL}/tests">View Details</a>
  `,

  jobApplication: (jobTitle: string, company: string) => `
    <h1>Application Received!</h1>
    <p>Your application for ${jobTitle} at ${company} has been submitted.</p>
    <p>We'll notify you when there's an update.</p>
  `,
};