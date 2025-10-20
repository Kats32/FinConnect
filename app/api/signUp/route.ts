import { NextRequest, NextResponse } from "next/server";
import { pool } from "../../../db/db";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, confirmPassword } = await req.json();

    if (!name || !email || !password || !confirmPassword) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
    }

    await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3)",
      [name, email, password]
    );

    return NextResponse.json({ message: "User created successfully!" });
  } catch (err: any) {
    console.error(err); // <--- Check terminal for the actual error
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}