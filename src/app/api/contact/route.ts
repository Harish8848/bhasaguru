import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, subject, message } = body;

    console.log('Contact form submitted:', { name, email, subject });

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "Name, email, subject, and message are required" },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    // Compose email content
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">New Contact Form Submission</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Name:</strong></td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${name}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Email:</strong></td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;"><a href="mailto:${email}">${email}</a></td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Phone:</strong></td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${phone || "Not provided"}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Subject:</strong></td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${subject}</td>
          </tr>
          <tr>
            <td style="padding: 10px;"><strong>Message:</strong></td>
            <td style="padding: 10px;">${message.replace(/\n/g, "<br/>")}</td>
          </tr>
        </table>
        <p style="color: #666; font-size: 12px; margin-top: 20px;">
          Sent from BhasaGuru Contact Form
        </p>
      </div>
    `;

    // Get recipient email
    const recipientEmail = process.env.CONTACT_EMAIL || "bhattharish2059@gmail.com";
    console.log('Sending to:', recipientEmail);

    // Send email with replyTo set to the submitter's email
    const result = await sendEmail({
      to: recipientEmail,
      subject: `[BhasaGuru] New Inquiry: ${subject}`,
      html: emailHtml,
      replyTo: email,
    });

    if (!result.success) {
      console.error('Failed to send contact email:', result.error);
      return NextResponse.json(
        { error: "Failed to send message. Please try again." },
        { status: 500 }
      );
    }

    console.log('Email sent successfully');

    // Create notification for admin
    try {
      await prisma.adminNotification.create({
        data: {
          type: 'CONTACT_FORM_SUBMISSION',
          title: 'New Contact Form Submission',
          message: `${name} submitted a contact form: "${subject}"`,
          metadata: {
            name,
            email,
            phone,
            subject,
          },
        },
      })
    } catch (notifError) {
      console.error('Failed to create contact notification:', notifError)
    }

    return NextResponse.json(
      { message: "Message sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
