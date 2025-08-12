import nodemailer from 'nodemailer';

// Email service for sending verification emails
class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_PORT === '465', // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  private getBaseUrl(): string {
    // Always use xed21.com for production-ready emails
    // This ensures consistent branding and proper domain for verification links
    return 'https://xed21.com';
  }

  async sendVerificationEmail(email: string, verificationToken: string): Promise<boolean> {
    try {
      console.log(`[sendVerificationEmail] Sending verification for ${email} with token: ${verificationToken}`);
      // Construct the correct backend API URL - this should match the route pattern
      const baseUrl = this.getBaseUrl();
      const verificationUrl = `${baseUrl}/api/auth/verify-email/${verificationToken}`;
      

      
      const mailOptions = {
        from: `"Xed21 - Education Platform" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Verify Your Email Address - Xed21',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Email Verification - Xed21</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
            <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 40px 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              
              <!-- Header -->
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #2563eb; font-size: 28px; margin: 0; font-weight: bold;">Xed21</h1>
                <p style="color: #6b7280; font-size: 16px; margin: 5px 0 0 0;">AI-Powered Education Platform</p>
              </div>

              <!-- Main Content -->
              <div style="text-align: center;">
                <h2 style="color: #1f2937; font-size: 24px; margin-bottom: 20px;">Verify Your Email Address</h2>
                
                <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                  Thank you for signing up with Xed21! To complete your registration and start generating AI-powered educational questions, please verify your email address by clicking the button below.
                </p>

                <!-- Verification Button -->
                <div style="margin: 30px 0;">
                  <a href="${verificationUrl}" 
                     style="display: inline-block; background-color: #2563eb; color: white; text-decoration: none; padding: 15px 30px; border-radius: 6px; font-weight: 600; font-size: 16px;">
                    Verify Email Address
                  </a>
                </div>

                <p style="color: #6b7280; font-size: 14px; margin-bottom: 20px;">
                  If the button doesn't work, you can copy and paste this link into your browser:
                </p>
                
                <p style="color: #2563eb; font-size: 14px; word-break: break-all; background-color: #f3f4f6; padding: 10px; border-radius: 4px; margin-bottom: 30px;">
                  ${verificationUrl}
                </p>

                <!-- Welcome Benefits -->
                <div style="background-color: #f0f9ff; padding: 20px; border-radius: 6px; margin-bottom: 30px;">
                  <h3 style="color: #1e40af; font-size: 18px; margin: 0 0 10px 0;">🎉 Welcome Bonus!</h3>
                  <p style="color: #1e40af; font-size: 14px; margin: 0;">
                    After verification, you'll receive <strong>500 free coins</strong> to start generating questions!
                  </p>
                </div>
              </div>

              <!-- Footer -->
              <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; text-align: center;">
                <p style="color: #6b7280; font-size: 12px; margin: 0 0 10px 0;">
                  This verification link will expire in 24 hours for security reasons.
                </p>
                <p style="color: #6b7280; font-size: 12px; margin: 0;">
                  If you didn't create an account with Xed21, please ignore this email.
                </p>
                <div style="margin-top: 15px;">
                  <p style="color: #9ca3af; font-size: 11px; margin: 0;">
                    © 2025 Xed21. All rights reserved. | 
                    <a href="mailto:contact@xed21.com" style="color: #2563eb; text-decoration: none;">contact@xed21.com</a> | 
                    +91 9435358512
                  </p>
                </div>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `
Welcome to Xed21!

Please verify your email address to complete your registration.

Verification Link: ${verificationUrl}

After verification, you'll receive 500 free coins to start generating AI-powered educational questions!

This link will expire in 24 hours.

If you didn't create an account with Xed21, please ignore this email.

Contact us: contact@xed21.com | +91 9435358512
© 2025 Xed21. All rights reserved.
        `
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Verification email sent to: ${email}`);
      return true;
    } catch (error) {
      console.error('Error sending verification email:', error);
      return false;
    }
  }

  async sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean> {
    try {
      // Construct the correct frontend URL
      const baseUrl = this.getBaseUrl();
      const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;
      

      
      const mailOptions = {
        from: `"Xed21 - Education Platform" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Reset Your Password - Xed21',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Password Reset - Xed21</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
            <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 40px 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              
              <!-- Header -->
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #2563eb; font-size: 28px; margin: 0; font-weight: bold;">Xed21</h1>
                <p style="color: #6b7280; font-size: 16px; margin: 5px 0 0 0;">AI-Powered Education Platform</p>
              </div>

              <!-- Main Content -->
              <div style="text-align: center;">
                <h2 style="color: #1f2937; font-size: 24px; margin-bottom: 20px;">Reset Your Password</h2>
                
                <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                  We received a request to reset your password. Click the button below to create a new password for your Xed21 account. This link will expire in 1 hour for security reasons.
                </p>

                <!-- Reset Button -->
                <div style="margin: 30px 0;">
                  <a href="${resetUrl}" 
                     style="display: inline-block; background-color: #dc2626; color: white; text-decoration: none; padding: 15px 30px; border-radius: 6px; font-weight: 600; font-size: 16px;">
                    Reset My Password
                  </a>
                </div>

                <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 15px; margin: 20px 0; text-align: left;">
                  <p style="color: #92400e; margin: 0; font-size: 14px;">
                    <strong>Security Note:</strong> If you didn't request this password reset, please ignore this email. Your account remains secure and no changes have been made.
                  </p>
                </div>

                <!-- Alternative Link -->
                <div style="margin: 30px 0;">
                  <p style="color: #6b7280; font-size: 14px; margin-bottom: 10px;">Or copy and paste this link into your browser:</p>
                  <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 4px; padding: 12px; word-break: break-all;">
                    <span style="color: #374151; font-size: 12px;">${resetUrl}</span>
                  </div>
                </div>
              </div>

              <!-- Footer -->
              <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 40px; text-align: center;">
                <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                  This password reset link expires in 1 hour.<br>
                  If you have any questions, contact our support team.
                </p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `Reset Your Password - Xed21

We received a request to reset your password. Click the link below to create a new password for your Xed21 account:

${resetUrl}

This link will expire in 1 hour for security reasons.

If you didn't request this password reset, please ignore this email. Your account remains secure and no changes have been made.

---
Xed21 - AI-Powered Education Platform`
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Password reset email sent to: ${email}`);
      return true;
    } catch (error) {
      console.error('Error sending password reset email:', error);
      return false;
    }
  }

  async sendWelcomeEmail(email: string, firstName?: string): Promise<boolean> {
    try {
      const baseUrl = this.getBaseUrl();
      const mailOptions = {
        from: `"Xed21 - Education Platform" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Welcome to Xed21 - Your AI Learning Journey Begins! 🎓',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to Xed21</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
            <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 40px 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              
              <!-- Header -->
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #2563eb; font-size: 28px; margin: 0; font-weight: bold;">Xed21</h1>
                <p style="color: #6b7280; font-size: 16px; margin: 5px 0 0 0;">AI-Powered Education Platform</p>
              </div>

              <!-- Main Content -->
              <div style="text-align: center;">
                <h2 style="color: #1f2937; font-size: 24px; margin-bottom: 20px;">
                  Welcome${firstName ? ` ${firstName}` : ''}! 🎉
                </h2>
                
                <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                  Your email has been successfully verified and your account is now active! You've received <strong>500 coins</strong> to start your AI-powered learning journey.
                </p>

                <!-- Features -->
                <div style="text-align: left; margin: 30px 0;">
                  <h3 style="color: #1f2937; font-size: 18px; margin-bottom: 20px; text-align: center;">What you can do with Xed21:</h3>
                  
                  <div style="margin-bottom: 15px;">
                    <strong style="color: #2563eb;">📝 Generate Questions:</strong>
                    <span style="color: #4b5563;"> Create AI-powered educational questions across all Indian education boards (CBSE, ICSE)</span>
                  </div>
                  
                  <div style="margin-bottom: 15px;">
                    <strong style="color: #2563eb;">🎯 Bloom's Taxonomy:</strong>
                    <span style="color: #4b5563;"> Target specific cognitive levels from Remembering to Creating</span>
                  </div>
                  
                  <div style="margin-bottom: 15px;">
                    <strong style="color: #2563eb;">📚 6 Question Types:</strong>
                    <span style="color: #4b5563;"> Multiple Choice, Multiple Select, Fill Blanks, True/False, Matching, and Inline Choice</span>
                  </div>
                  
                  <div style="margin-bottom: 15px;">
                    <strong style="color: #2563eb;">💰 Coin System:</strong>
                    <span style="color: #4b5563;"> Affordable pricing starting from 5 coins per question</span>
                  </div>
                </div>

                <!-- CTA Button -->
                <div style="margin: 30px 0;">
                  <a href="${baseUrl}/dashboard" 
                     style="display: inline-block; background-color: #2563eb; color: white; text-decoration: none; padding: 15px 30px; border-radius: 6px; font-weight: 600; font-size: 16px;">
                    Start Generating Questions
                  </a>
                </div>
              </div>

              <!-- Footer -->
              <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; text-align: center;">
                <p style="color: #6b7280; font-size: 12px; margin: 0 0 10px 0;">
                  Need help? Contact our support team at contact@xed21.com
                </p>
                <div style="margin-top: 15px;">
                  <p style="color: #9ca3af; font-size: 11px; margin: 0;">
                    © 2025 Xed21. All rights reserved. | 
                    <a href="mailto:contact@xed21.com" style="color: #2563eb; text-decoration: none;">contact@xed21.com</a> | 
                    +91 9435358512
                  </p>
                </div>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `
Welcome${firstName ? ` ${firstName}` : ''} to Xed21!

Your email has been successfully verified and your account is now active! You've received 500 coins to start your AI-powered learning journey.

What you can do with Xed21:
- Generate AI-powered educational questions across all Indian education boards
- Target specific cognitive levels using Bloom's Taxonomy
- Create 6 different question types
- Affordable pricing starting from 5 coins per question

Start generating questions: ${baseUrl}/dashboard

Need help? Contact us at contact@xed21.com | +91 9435358512
© 2025 Xed21. All rights reserved.
        `
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Welcome email sent to: ${email}`);
      return true;
    } catch (error) {
      console.error('Error sending welcome email:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();