import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const emailService = {
  // Send a generic email
  async sendEmail(options) {
    try {
      const { data, error } = await resend.emails.send({
        from: options.from || 'Blog <noreply@yourdomain.com>',
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });

      if (error) {
        console.error('Email sending error:', error);
        throw new Error(error.message);
      }

      return { success: true, data };
    } catch (error) {
      console.error('Failed to send email:', error);
      return { success: false, error };
    }
  },

  // Send newsletter confirmation email
  async sendNewsletterConfirmation(email, confirmationUrl) {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .button { 
              display: inline-block; 
              padding: 12px 24px; 
              background-color: #0070f3; 
              color: white; 
              text-decoration: none; 
              border-radius: 5px; 
              margin: 20px 0;
            }
            .footer { margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Confirm Your Subscription</h2>
            <p>Thank you for subscribing to our newsletter!</p>
            <p>Please confirm your email address by clicking the button below:</p>
            <a href="${confirmationUrl}" class="button">Confirm Subscription</a>
            <p>If you didn't subscribe to this newsletter, you can safely ignore this email.</p>
            <div class="footer">
              <p>This email was sent to ${email}</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Confirm Your Newsletter Subscription',
      html,
    });
  },

  // Send welcome email to new subscribers
  async sendWelcomeEmail(email, name) {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #f8f9fa; padding: 20px; text-align: center; }
            .content { padding: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Our Blog!</h1>
            </div>
            <div class="content">
              <p>Hi ${name || 'there'},</p>
              <p>Thank you for subscribing to our newsletter. We're excited to have you on board!</p>
              <p>You'll receive updates about our latest blog posts, insights, and exclusive content.</p>
              <p>Stay tuned for great content!</p>
              <p>Best regards,<br>The Blog Team</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Welcome to Our Blog!',
      html,
    });
  },

  // Send contact form notification to admin
  async sendContactFormNotification(formData) {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .field { margin: 15px 0; }
            .label { font-weight: bold; color: #555; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>New Contact Form Submission</h2>
            <div class="field">
              <div class="label">Name:</div>
              <div>${formData.name}</div>
            </div>
            <div class="field">
              <div class="label">Email:</div>
              <div>${formData.email}</div>
            </div>
            <div class="field">
              <div class="label">Subject:</div>
              <div>${formData.subject}</div>
            </div>
            <div class="field">
              <div class="label">Message:</div>
              <div>${formData.message}</div>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: process.env.ADMIN_EMAIL || 'admin@yourdomain.com',
      subject: `Contact Form: ${formData.subject}`,
      html,
    });
  },

  // Send auto-reply to contact form submitter
  async sendContactFormAutoReply(email, name) {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Thank You for Contacting Us</h2>
            <p>Hi ${name},</p>
            <p>We've received your message and will get back to you as soon as possible.</p>
            <p>We typically respond within 24-48 hours.</p>
            <p>Best regards,<br>The Blog Team</p>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: 'We Received Your Message',
      html,
    });
  },
};
