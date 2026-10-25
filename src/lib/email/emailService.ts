import crypto from "crypto";
import nodemailer from "nodemailer";
import { COLLEGE_CONFIG } from "@/lib/college/config";

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
  templateType: "otp_verification" | "welcome_activation" | "account_rejected" | "password_reset" | "password_changed" | "admin_mfa" | "suspicious_login";
}

export interface EmailDeliveryResult {
  success: boolean;
  messageId: string;
  provider: string;
  error?: string;
}

// In-memory audit of sent emails to prevent duplicate welcome emails (idempotency)
const sentEmailsAudit = new Set<string>();

export class EmailService {
  /**
   * Dispatches an email using configured SMTP Relay (Nodemailer) or Resend API.
   * Sends directly to the student's registered email address.
   * Never hardcodes or replaces the recipient address.
   */
  static async sendEmail(options: SendEmailOptions): Promise<EmailDeliveryResult> {
    const messageId = `msg_${Date.now()}_${crypto.randomBytes(6).toString("hex")}`;
    const fromName = process.env.EMAIL_FROM_NAME || "SkillMatch AI (KCE Placement Portal)";
    const recipient = options.to.trim().toLowerCase();

    // In unit test environment (Vitest / Jest), mock delivery to avoid external network dependencies
    if (process.env.NODE_ENV === "test" || process.env.VITEST) {
      return {
        success: true,
        messageId: `test_${messageId}`,
        provider: "test_mock",
      };
    }

    // 1. Check SMTP Relay (Nodemailer) first if credentials are provided
    // SMTP Relay (e.g. Gmail App Password, Brevo SMTP, Amazon SES) allows sending to ANY college email address
    // without requiring DNS domain verification of the recipient domain.
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        const port = parseInt(process.env.SMTP_PORT || "587", 10);
        const secure = process.env.SMTP_SECURE === "true" || port === 465;

        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port,
          secure,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
          tls: {
            rejectUnauthorized: process.env.NODE_ENV === "production",
          },
        });

        const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER;
        const info = await transporter.sendMail({
          from: `"${fromName}" <${fromAddress}>`,
          to: recipient,
          subject: options.subject,
          text: options.text,
          html: options.html,
        });

        console.log(`[EmailService] Dispatched via SMTP to ${recipient} (MessageId: ${info.messageId})`);
        return {
          success: true,
          messageId: info.messageId || messageId,
          provider: "smtp",
        };
      } catch (smtpErr: any) {
        console.error(`[EmailService] SMTP delivery error to ${recipient}:`, smtpErr.message);
        return {
          success: false,
          messageId,
          provider: "smtp",
          error: `SMTP delivery error: ${smtpErr.message || "Failed to connect to SMTP server"}`,
        };
      }
    }

    // 2. Check Resend API if configured
    if (process.env.RESEND_API_KEY) {
      try {
        const resendFrom = process.env.EMAIL_FROM_ADDRESS || "onboarding@resend.dev";

        const payload = {
          from: `${fromName} <${resendFrom}>`,
          to: [recipient],
          subject: options.subject,
          html: options.html,
          text: options.text,
        };

        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (res.ok && data?.id) {
          console.log(`[EmailService] Dispatched via Resend to ${recipient} (ID: ${data.id})`);
          return {
            success: true,
            messageId: data.id,
            provider: "resend",
          };
        }

        // Resend returned an error (e.g. 403 sandbox restriction, 401 unauth, 422 invalid)
        const errorDetail = data?.message || "Resend rejected the email delivery request.";
        console.error(`[EmailService] Resend API error for ${recipient}: ${errorDetail}`);

        // Provide clear, actionable diagnostics
        let userFriendlyError = errorDetail;
        if (errorDetail.includes("verify a domain") || errorDetail.includes("only send testing emails")) {
          userFriendlyError = `Resend sandbox active: Resend's default test domain (onboarding@resend.dev) restricts delivery. To send real OTPs to students at @kce.ac.in, configure SMTP in .env.local (e.g., Gmail SMTP / Brevo) or verify your sending domain at resend.com/domains.`;
        }

        return {
          success: false,
          messageId,
          provider: "resend",
          error: userFriendlyError,
        };
      } catch (err: any) {
        console.error(`[EmailService] Resend network error for ${recipient}:`, err.message);
        return {
          success: false,
          messageId,
          provider: "resend",
          error: `Resend connection failed: ${err.message}`,
        };
      }
    }

    // 3. Neither provider configured
    console.error("[EmailService] No email provider configured (missing SMTP or RESEND_API_KEY).");
    return {
      success: false,
      messageId,
      provider: "none",
      error: "No email delivery provider is configured. Please add SMTP credentials (e.g., Gmail / Brevo) or Resend API key to .env.local.",
    };
  }

  /**
   * Send 6-digit email OTP verification code to student's verified college email.
   */
  static async sendOTPEmail(email: string, fullName: string, otpCode: string): Promise<EmailDeliveryResult> {
    const subject = `Your SkillMatch AI Verification Code: ${otpCode}`;
    const text = `Hello ${fullName},\n\nYour one-time verification code for SkillMatch AI (Karpagam College of Engineering) is: ${otpCode}\n\nThis code expires in 5 minutes. Do not share this code with anyone.\n\nKCE Placement Cell`;

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; background-color: #f8faf9; padding: 32px 16px;">
        <div style="background-color: #ffffff; border-radius: 16px; border: 1px solid #e7e5e4; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
          <div style="display: flex; align-items: center; margin-bottom: 24px;">
            <div style="background-color: #0f766e; color: #ffffff; width: 36px; height: 36px; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; font-size: 18px; text-align: center; line-height: 36px; margin-right: 12px;">⚡</div>
            <div>
              <h2 style="margin: 0; color: #0f172a; font-size: 18px; font-weight: 800;">SkillMatch AI</h2>
              <p style="margin: 0; color: #64748b; font-size: 11px;">Karpagam College of Engineering · Placement Portal</p>
            </div>
          </div>
          <h3 style="color: #0f172a; margin-top: 0; font-size: 20px;">Email Verification</h3>
          <p style="color: #475569; font-size: 14px; line-height: 1.6;">Hello <strong>${fullName}</strong>,</p>
          <p style="color: #475569; font-size: 14px; line-height: 1.6;">Thank you for registering on SkillMatch AI. Please use the following 6-digit verification code to confirm your official college email address:</p>
          
          <div style="text-align: center; margin: 28px 0;">
            <div style="display: inline-block; background-color: #f0fdfa; border: 2px dashed #0d9488; border-radius: 12px; padding: 14px 28px; font-size: 32px; font-weight: 900; letter-spacing: 6px; color: #0f766e; font-family: monospace;">
              ${otpCode}
            </div>
          </div>

          <p style="color: #64748b; font-size: 12px; line-height: 1.5;">⏱️ <strong>Valid for 5 minutes.</strong> For your security, this code is single-use and should never be shared with anyone.</p>
          <p style="color: #64748b; font-size: 12px; line-height: 1.5; margin-top: 16px;">After email verification, your student identity will be submitted to the Karpagam College of Engineering placement office for approval.</p>
          
          <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
          <p style="color: #94a3b8; font-size: 11px; text-align: center; margin: 0;">© 2026 Karpagam College of Engineering · SkillMatch AI Placement Portal</p>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: email,
      subject,
      text,
      html,
      templateType: "otp_verification",
    });
  }

  /**
   * Send personalized welcome email after College Admin approval and account activation.
   */
  static async sendWelcomeActivationEmail(student: {
    fullName: string;
    collegeEmail: string;
    rollNumber: string;
    department: string;
    degree: string;
  }): Promise<EmailDeliveryResult> {
    const idempotencyKey = `welcome_${student.collegeEmail}`;
    if (sentEmailsAudit.has(idempotencyKey)) {
      return { success: true, messageId: "already_sent_idempotent", provider: "audit" };
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const signInUrl = `${appUrl}/login`;

    const subject = "Welcome to SkillMatch AI — Your Placement Preparation Journey Starts Here!";
    const text = `Hello ${student.fullName},\n\nCongratulations! Your student account for Karpagam College of Engineering (${student.department}) has been verified and approved by the placement cell.\n\nYou can now sign in at ${signInUrl} to access:\n- AI Mock Interviews with our real-time speaking HR recruiter\n- Resume Analysis & Placement Alignment Scoring\n- Personalized skill-gap recommendations\n\nKeep your account credentials confidential.\n\nWarm regards,\nKCE Placement Cell & SkillMatch AI Team`;

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 620px; margin: 0 auto; background-color: #f8faf9; padding: 32px 16px;">
        <div style="background-color: #ffffff; border-radius: 20px; border: 1px solid #e7e5e4; padding: 36px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
          
          <div style="border-bottom: 2px solid #0f766e; padding-bottom: 20px; margin-bottom: 24px;">
            <div style="display: flex; align-items: center;">
              <span style="font-size: 24px; font-weight: 900; color: #0f172a;">SkillMatch <span style="color: #0f766e;">AI</span></span>
            </div>
            <p style="margin: 4px 0 0; color: #64748b; font-size: 12px; font-weight: 600;">Karpagam College of Engineering · Department of Training & Placements</p>
          </div>

          <h1 style="color: #0f172a; font-size: 22px; font-weight: 800; margin-top: 0; line-height: 1.3;">
            Welcome, ${student.fullName}! 🎉
          </h1>
          <p style="color: #0f766e; font-weight: 700; font-size: 14px; margin-top: -6px;">
            Your Placement Practice Account Is Officially Activated
          </p>

          <p style="color: #334155; font-size: 14px; line-height: 1.6;">
            We are pleased to inform you that your identity details (Roll Number: <strong>${student.rollNumber}</strong>, Department: <strong>${student.department}</strong>) have been verified and approved by the <strong>Karpagam College of Engineering</strong> Placement Cell.
          </p>

          <div style="background-color: #f0fdfa; border: 1px solid #ccfbf1; border-radius: 14px; padding: 20px; margin: 24px 0;">
            <h3 style="margin: 0 0 12px 0; color: #0f766e; font-size: 15px; font-weight: 800;">What You Can Do Now on SkillMatch AI:</h3>
            <ul style="margin: 0; padding-left: 20px; color: #334155; font-size: 13px; line-height: 1.8;">
              <li><strong>Resume Extraction & Alignment:</strong> Upload your resume to extract core projects, frameworks, and get instant recruiter alignment feedback.</li>
              <li><strong>Live Face-to-Face AI Voice Interviews:</strong> Practice placement rounds with our speaking AI HR recruiter (Sarah Jenkins) tailored to your targeted roles.</li>
              <li><strong>Personalized Feedback & Skill-Gap Analysis:</strong> Receive question-by-question scoring, model answers, and placement preparation tips.</li>
              <li><strong>Targeted Campus Roles:</strong> Choose customized roles such as ServiceNow Developer, Full Stack Engineer, Java Developer, and more.</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 32px 0;">
            <a href="${signInUrl}" style="background-color: #0f766e; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 700; padding: 14px 32px; border-radius: 12px; display: inline-block; box-shadow: 0 2px 4px rgba(15,118,110,0.2);">
              Sign In to Your Student Dashboard →
            </a>
          </div>

          <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 12px; padding: 14px; margin: 24px 0;">
            <p style="margin: 0; color: #92400e; font-size: 12px; line-height: 1.5;">
              🔒 <strong>Security Reminder:</strong> Never share your login credentials or password with anyone. The placement office will never ask for your account password.
            </p>
          </div>

          <p style="color: #64748b; font-size: 13px; line-height: 1.6;">
            If you need assistance or have questions, reach out to the KCE Placement Cell at <a href="mailto:${COLLEGE_CONFIG.supportEmail}" style="color: #0f766e;">${COLLEGE_CONFIG.supportEmail}</a>.
          </p>

          <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 28px 0;" />
          <p style="color: #94a3b8; font-size: 11px; text-align: center; margin: 0;">
            Karpagam College of Engineering · Pollachi Main Road, Eachanari, Coimbatore, Tamil Nadu 641021
          </p>
        </div>
      </div>
    `;

    const res = await this.sendEmail({
      to: student.collegeEmail,
      subject,
      text,
      html,
      templateType: "welcome_activation",
    });

    if (res.success) {
      sentEmailsAudit.add(idempotencyKey);
    }
    return res;
  }

  /**
   * Send rejection notice with required admin reason and correction instructions.
   */
  static async sendRejectionEmail(student: {
    fullName: string;
    collegeEmail: string;
    rejectionReason: string;
  }): Promise<EmailDeliveryResult> {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const statusUrl = `${appUrl}/status`;

    const subject = "Update Required: SkillMatch AI College Verification";
    const text = `Hello ${student.fullName},\n\nYour SkillMatch AI college registration for Karpagam College of Engineering was reviewed by the placement cell. Verification could not be completed for the following reason:\n\n"${student.rejectionReason}"\n\nPlease log in at ${statusUrl} to correct your details and resubmit for approval.\n\nKCE Placement Cell`;

    const html = `
      <div style="font-family: sans-serif; max-width: 580px; margin: 0 auto; background-color: #f8faf9; padding: 32px 16px;">
        <div style="background-color: #ffffff; border-radius: 16px; border: 1px solid #e7e5e4; padding: 32px;">
          <h3 style="color: #dc2626; margin-top: 0; font-size: 20px;">Verification Update Needed</h3>
          <p style="color: #475569; font-size: 14px;">Hello <strong>${student.fullName}</strong>,</p>
          <p style="color: #475569; font-size: 14px; line-height: 1.6;">
            Your registration details for <strong>Karpagam College of Engineering</strong> were reviewed. The verification could not be completed due to the following reason:
          </p>
          
          <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 14px; margin: 18px 0; color: #991b1b; font-size: 13px;">
            <strong>Placement Cell Feedback:</strong><br/>
            ${student.rejectionReason}
          </div>

          <p style="color: #475569; font-size: 14px;">You can review and update your roll number, college ID, or department details directly from your verification status screen:</p>
          
          <div style="text-align: center; margin: 24px 0;">
            <a href="${statusUrl}" style="background-color: #0f766e; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: bold; padding: 12px 24px; border-radius: 10px; display: inline-block;">
              Review & Resubmit Details →
            </a>
          </div>
          
          <p style="color: #94a3b8; font-size: 11px; text-align: center;">Karpagam College of Engineering · SkillMatch AI</p>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: student.collegeEmail,
      subject,
      text,
      html,
      templateType: "account_rejected",
    });
  }

  /**
   * Send Password Reset token link.
   */
  static async sendPasswordResetEmail(email: string, fullName: string, resetToken: string): Promise<EmailDeliveryResult> {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const resetUrl = `${appUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    const subject = "Reset Your SkillMatch AI Password";
    const text = `Hello ${fullName},\n\nWe received a request to reset your password for SkillMatch AI (Karpagam College of Engineering). Click the link below to set a new password:\n\n${resetUrl}\n\nThis link expires in 15 minutes. If you did not request this, please ignore this email.\n\nKCE Placement Cell`;

    const html = `
      <div style="font-family: sans-serif; max-width: 580px; margin: 0 auto; background-color: #f8faf9; padding: 32px 16px;">
        <div style="background-color: #ffffff; border-radius: 16px; border: 1px solid #e7e5e4; padding: 32px;">
          <h3 style="color: #0f172a; margin-top: 0;">Password Reset Request</h3>
          <p style="color: #475569; font-size: 14px;">Hello <strong>${fullName}</strong>,</p>
          <p style="color: #475569; font-size: 14px; line-height: 1.6;">
            We received a request to reset your password for your <strong>Karpagam College of Engineering</strong> SkillMatch AI account.
          </p>
          
          <div style="text-align: center; margin: 28px 0;">
            <a href="${resetUrl}" style="background-color: #0f766e; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: bold; padding: 12px 28px; border-radius: 10px; display: inline-block;">
              Reset Password
            </a>
          </div>

          <p style="color: #64748b; font-size: 12px;">This single-use link is valid for 15 minutes. If you did not request this, your account is safe and no action is required.</p>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: email,
      subject,
      text,
      html,
      templateType: "password_reset",
    });
  }

  /**
   * Send Admin MFA verification code.
   */
  static async sendAdminMFAEmail(email: string, fullName: string, mfaCode: string): Promise<EmailDeliveryResult> {
    const subject = `Admin Multi-Factor Verification Code: ${mfaCode}`;
    const text = `Hello ${fullName},\n\nYour administrator MFA login code for SkillMatch AI (KCE Portal) is: ${mfaCode}\n\nValid for 5 minutes. Do not share.`;
    const html = `
      <div style="font-family: sans-serif; padding: 24px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; max-width: 500px; margin: 0 auto;">
        <h3 style="color: #0f172a; margin-top: 0;">Admin MFA Authentication</h3>
        <p style="color: #475569; font-size: 14px;">Hello <strong>${fullName}</strong>,</p>
        <p style="color: #475569; font-size: 14px;">Your 6-digit administrator MFA code for Karpagam College of Engineering portal access is:</p>
        <div style="text-align: center; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #0f766e; background: #f0fdfa; padding: 10px 24px; border-radius: 8px; border: 1px solid #99f6e4;">
            ${mfaCode}
          </span>
        </div>
        <p style="color: #94a3b8; font-size: 11px;">Expires in 5 minutes. Never disclose this code.</p>
      </div>
    `;

    return this.sendEmail({
      to: email,
      subject,
      text,
      html,
      templateType: "admin_mfa",
    });
  }
}
