import { NextRequest, NextResponse } from "next/server";
import { pool } from "../../../db/db";
import crypto from 'crypto';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

function generateOTP() {
  return crypto.randomInt(100000, 999999).toString();
}

async function sendVerificationEmail(email: string, otp: string) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your FinConnect Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #8B5CF6;">Verification Code</h2>
        <p>Use the verification code below to verify your email address:</p>
        <div style="background: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
          <h1 style="color: #8B5CF6; font-size: 32px; letter-spacing: 5px; margin: 0;">${otp}</h1>
        </div>
        <p>This code will expire in 10 minutes.</p>
        <br>
        <p>Best regards,<br>The FinConnect Team</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

export async function POST(req: NextRequest) {
  try {
    const { email, type = 'verification' } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Check if user exists
    const userResult = await pool.query(
      "SELECT name FROM users WHERE email = $1",
      [email]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Generate new OTP
    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Invalidate previous OTPs
    await pool.query(
      "UPDATE otps SET used = true WHERE email = $1 AND type = $2",
      [email, type]
    );

    // Store new OTP
    await pool.query(
      "INSERT INTO otps (email, otp_code, type, expires_at) VALUES ($1, $2, $3, $4)",
      [email, otpCode, type, expiresAt]
    );

    // Send email
    await sendVerificationEmail(email, otpCode);

    return NextResponse.json({ 
      message: "Verification code sent successfully!" 
    });
  } catch (err: any) {
    console.error("Resend OTP error:", err);
    return NextResponse.json({ error: "Failed to send verification code" }, { status: 500 });
  }
}