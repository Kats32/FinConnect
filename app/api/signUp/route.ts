import { NextRequest, NextResponse } from "next/server";
import { pool } from "../../../db/db";
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

// Email transporter with better error handling
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

function generateOTP() {
  return crypto.randomInt(100000, 999999).toString();
}

async function sendVerificationEmail(email: string, name: string, otp: string) {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verify Your FinConnect Account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #8B5CF6;">Welcome to FinConnect, ${name}!</h2>
          <p>Thank you for creating an account. Please use the verification code below to verify your email address:</p>
          <div style="background: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #8B5CF6; font-size: 32px; letter-spacing: 5px; margin: 0;">${otp}</h1>
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't create an account with FinConnect, please ignore this email.</p>
          <br>
          <p>Best regards,<br>The FinConnect Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log("Signup API called");
    
    const body = await req.json().catch(() => {
      throw new Error("Invalid JSON in request body");
    });

    const { name, email, password, confirmPassword } = body;

    console.log("Received data:", { name, email });

    // Validation
    if (!name || !email || !password || !confirmPassword) {
      return NextResponse.json(
        { error: "All fields are required" }, 
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match" }, 
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" }, 
        { status: 400 }
      );
    }

    // Check if user already exists
    let existingUser;
    try {
      existingUser = await pool.query(
        "SELECT id FROM users WHERE email = $1",
        [email]
      );
    } catch (dbError) {
      console.error("Database error checking existing user:", dbError);
      return NextResponse.json(
        { error: "Database connection error" }, 
        { status: 500 }
      );
    }

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { error: "User already exists with this email" }, 
        { status: 400 }
      );
    }

    // Hash password
    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(password, 10);
    } catch (hashError) {
      console.error("Password hashing error:", hashError);
      return NextResponse.json(
        { error: "Error processing password" }, 
        { status: 500 }
      );
    }

    // Insert user
    try {
      await pool.query(
        "INSERT INTO users (name, email, password) VALUES ($1, $2, $3)",
        [name, email, hashedPassword]
      );
      console.log(`User created for email: ${email}`);
    } catch (insertError) {
      console.error("Error inserting user:", insertError);
      return NextResponse.json(
        { error: "Error creating user account" }, 
        { status: 500 }
      );
    }

    // Generate OTP
    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP
    try {
      await pool.query(
        "INSERT INTO otps (email, otp_code, type, expires_at) VALUES ($1, $2, $3, $4)",
        [email, otpCode, 'verification', expiresAt]
      );
      console.log(`OTP stored for email: ${email}`);
    } catch (otpError) {
      console.error("Error storing OTP:", otpError);
      // Don't fail the signup if OTP storage fails
    }

    // Send verification email
    const emailSent = await sendVerificationEmail(email, name, otpCode);

    return NextResponse.json({ 
      message: "User created successfully!" + (emailSent ? " Please check your email for verification code." : " But failed to send verification email."),
      email: email,
      emailSent: emailSent
    });

  } catch (err: any) {
    console.error("Signup API error:", err);
    
    // Return proper JSON error response
    return NextResponse.json(
      { error: err.message || "Internal server error" }, 
      { status: 500 }
    );
  }
}