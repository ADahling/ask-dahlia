import { Resend } from 'resend';

// Initialize Resend with API key
const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

// Email notification target
const notifyEmail = process.env.ACCESS_REQUEST_NOTIFY_TO;

/**
 * Send access request notification
 * @param request Access request data
 */
export async function sendAccessRequestNotification(request: {
  id: string;
  firstName: string;
  lastName: string;
  title: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  reason: string;
}) {
  // Skip if configuration is missing
  if (!resend || !notifyEmail) {
    console.log('Email notification skipped: Resend API key or notification email not configured');
    return;
  }

  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ask-dahlia.netlify.app';
    const approvalsUrl = `${appUrl}/approvals`;

    await resend.emails.send({
      from: 'Ask Dahlia <no-reply@ask-dahlia.co>',
      to: notifyEmail,
      subject: `New Ask Dahlia Access Request: ${request.firstName} ${request.lastName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #9333ea;">New Access Request</h1>

          <p><strong>A new user has requested access to Ask Dahlia:</strong></p>

          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Name:</strong> ${request.firstName} ${request.lastName}</p>
            <p><strong>Title:</strong> ${request.title}</p>
            <p><strong>Company:</strong> ${request.company}</p>
            <p><strong>Email:</strong> ${request.email}</p>
            <p><strong>Phone:</strong> ${request.phone}</p>
            <p><strong>Address:</strong> ${request.address}</p>
            <hr style="border: 0; border-top: 1px solid #ddd; margin: 15px 0;" />
            <p><strong>Reason for Access:</strong></p>
            <p style="white-space: pre-line;">${request.reason}</p>
          </div>

          <p>
            <a href="${approvalsUrl}" style="display: inline-block; background: #9333ea; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">
              Review Access Requests
            </a>
          </p>

          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            This is an automated message from Ask Dahlia. Please do not reply to this email.
          </p>
        </div>
      `,
    });

    console.log(`Access request notification sent to ${notifyEmail}`);
  } catch (error) {
    console.error('Failed to send access request notification:', error);
  }
}

/**
 * Send welcome email with temporary password
 * @param user New user data
 * @param tempPassword Temporary password
 */
export async function sendWelcomeEmail(
  user: { firstName: string; lastName: string; email: string },
  tempPassword: string
) {
  // Skip if configuration is missing
  if (!resend) {
    console.log('Welcome email skipped: Resend API key not configured');
    return;
  }

  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ask-dahlia.netlify.app';

    await resend.emails.send({
      from: 'Ask Dahlia <no-reply@ask-dahlia.co>',
      to: user.email,
      subject: 'Welcome to Ask Dahlia: Your Access Has Been Approved',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #9333ea;">Welcome to Ask Dahlia</h1>

          <p>Dear ${user.firstName},</p>

          <p>Your access request for Ask Dahlia has been approved. You can now sign in using the following credentials:</p>

          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Temporary Password:</strong> ${tempPassword}</p>
          </div>

          <p>You'll be prompted to change your password upon first login.</p>

          <p>
            <a href="${appUrl}/login" style="display: inline-block; background: #9333ea; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">
              Sign In
            </a>
          </p>

          <p>If you have any questions, please don't hesitate to reach out.</p>

          <p>Best regards,<br>The Ask Dahlia Team</p>

          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            This is an automated message from Ask Dahlia. Please do not reply to this email.
          </p>
        </div>
      `,
    });

    console.log(`Welcome email sent to ${user.email}`);
  } catch (error) {
    console.error('Failed to send welcome email:', error);
  }
}
