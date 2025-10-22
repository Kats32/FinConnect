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

async function sendPasswordResetEmail(email: string, otp: string) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'FinConnect Password Reset',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #8B5CF6;">Password Reset Request</h2>
        <p>We received a request to reset your FinConnect account password.</p>
        <p>Use the verification code below to reset your password:</p>
        <div style="background: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
          <h1 style="color: #8B5CF6; font-size: 32px; letter-spacing: 5px; margin: 0;">${otp}</h1>
        </div>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request a password reset, please ignore this email.</p>
        <br>
        <p>Best regards,<br>The FinConnect Team</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Check if user exists
    const userResult = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (userResult.rows.length === 0) {
      // Don't reveal that user doesn't exist
      return NextResponse.json({ 
        message: "If an account with that email exists, a verification code has been sent." 
      });
    }

    // Generate OTP
    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP
    await pool.query(
      "INSERT INTO otps (email, otp_code, type, expires_at) VALUES ($1, $2, $3, $4)",
      [email, otpCode, 'password_reset', expiresAt]
    );

    // Send email
    await sendPasswordResetEmail(email, otpCode);

    return NextResponse.json({ 
      message: "If an account with that email exists, a verification code has been sent." 
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}