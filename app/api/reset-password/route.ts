import { NextRequest, NextResponse } from "next/server";
import { pool } from "../../../db/db";

export async function POST(req: NextRequest) {
  try {
    const { email, otp, newPassword } = await req.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    // Verify OTP
    const otpResult = await pool.query(
      "SELECT * FROM otps WHERE email = $1 AND otp_code = $2 AND type = $3 AND used = false AND expires_at > NOW()",
      [email, otp, 'password_reset']
    );

    if (otpResult.rows.length === 0) {
      return NextResponse.json({ error: "Invalid or expired verification code" }, { status: 400 });
    }

    // Update password
    await pool.query(
      "UPDATE users SET password = $1 WHERE email = $2",
      [newPassword, email]
    );

    // Mark OTP as used
    await pool.query(
      "UPDATE otps SET used = true WHERE email = $1 AND otp_code = $2",
      [email, otp]
    );

    return NextResponse.json({ message: "Password reset successfully" });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}