import { NextRequest, NextResponse } from "next/server";
import { pool } from "../../../db/db";

export async function POST(req: NextRequest) {
  try {
    const { email, otp, type = 'verification' } = await req.json();

    console.log("OTP Verification request:", { email, otp, type });

    // Validation
    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email and OTP are required" }, 
        { status: 400 }
      );
    }

    if (otp.length !== 6) {
      return NextResponse.json(
        { error: "OTP must be 6 digits" }, 
        { status: 400 }
      );
    }

    // Verify OTP
    const result = await pool.query(
      `SELECT * FROM otps 
       WHERE email = $1 AND otp_code = $2 AND type = $3 
       AND used = false AND expires_at > NOW()`,
      [email, otp, type]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Invalid or expired verification code" }, 
        { status: 400 }
      );
    }

    const otpRecord = result.rows[0];

    // Mark OTP as used
    await pool.query(
      "UPDATE otps SET used = true WHERE id = $1",
      [otpRecord.id]
    );

    // If it's email verification, mark user as verified
    if (type === 'verification') {
      await pool.query(
        "UPDATE users SET is_verified = true WHERE email = $1",
        [email]
      );
      
      console.log(`✅ User verified: ${email}`);
    }

    return NextResponse.json({ 
      success: true,
      message: type === 'verification' 
        ? "Email verified successfully!" 
        : "OTP verified successfully!"
    });

  } catch (err: any) {
    console.error("OTP verification error:", err);
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
}