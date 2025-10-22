import { NextRequest, NextResponse } from "next/server";
import { pool } from "../../../db/db";
import bcrypt from 'bcrypt';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    console.log("Login attempt for email:", email); // Debug log

    // Validation
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    // Check if user exists
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      console.log("User not found:", email); // Debug log
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const user = result.rows[0];
    console.log("User found:", { id: user.id, email: user.email, is_verified: user.is_verified }); // Debug log
    
    // Compare hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      console.log("Invalid password for user:", email); // Debug log
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // Check if user is verified
    if (!user.is_verified) {
      console.log("User not verified:", email); // Debug log
      return NextResponse.json({ 
        error: "Please verify your email before logging in. Check your email for the verification code." 
      }, { status: 401 });
    }

    // Return user data (excluding password)
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      date_of_birth: user.date_of_birth,
      profile_picture: user.profile_picture,
      bio: user.bio,
      is_verified: user.is_verified,
      created_at: user.created_at
    };

    console.log("Login successful, returning user:", userResponse); // Debug log

    return NextResponse.json({ 
      message: "Login successful!", 
      user: userResponse
    });
  } catch (err: any) {
    console.error("Login API error:", err);
    return NextResponse.json({ 
      error: err.message || "Internal server error" 
    }, { status: 500 });
  }
}