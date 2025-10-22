import { NextRequest, NextResponse } from "next/server";
import { pool } from "../../../db/db";

// Helper function to get user from request
async function getAuthenticatedUser(req: NextRequest) {
  try {
    // Get user ID from query parameter (temporary solution)
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');
    
    if (!userId) {
      throw new Error("User ID is required");
    }
    
    return { id: parseInt(userId) };
  } catch (error) {
    console.error("Authentication error:", error);
    throw new Error("Authentication failed");
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    
    console.log("Fetching profile for user ID:", user.id);
    
    const result = await pool.query(
      "SELECT id, name, email, phone, date_of_birth, profile_picture, bio, created_at, is_verified FROM users WHERE id = $1",
      [user.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userData = result.rows[0];
    
    // Format date for frontend if it exists
    if (userData.date_of_birth) {
      userData.date_of_birth = new Date(userData.date_of_birth).toISOString().split('T')[0];
    }

    return NextResponse.json({ user: userData });
  } catch (err: any) {
    console.error("Profile GET error:", err);
    return NextResponse.json({ 
      error: err.message || "Internal server error" 
    }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    const { name, phone, date_of_birth, bio } = await req.json();

    console.log("Updating profile for user ID:", user.id, { name, phone, date_of_birth, bio });

    // Validate required fields
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    await pool.query(
      "UPDATE users SET name = $1, phone = $2, date_of_birth = $3, bio = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5",
      [name, phone, date_of_birth, bio, user.id]
    );

    return NextResponse.json({ 
      message: "Profile updated successfully",
      user: {
        id: user.id,
        name,
        phone,
        date_of_birth,
        bio
      }
    });
  } catch (err: any) {
    console.error("Profile PUT error:", err);
    return NextResponse.json({ 
      error: err.message || "Internal server error" 
    }, { status: 500 });
  }
}

// Profile picture upload endpoint
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    const formData = await req.formData();
    const profilePicture = formData.get('profilePicture') as File;

    if (!profilePicture) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (!profilePicture.type.startsWith('image/')) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 });
    }

    // Validate file size (5MB limit)
    if (profilePicture.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Image size must be less than 5MB" }, { status: 400 });
    }

    console.log("Uploading profile picture for user ID:", user.id);

    // Convert file to base64
    const bytes = await profilePicture.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = `data:${profilePicture.type};base64,${buffer.toString('base64')}`;

    await pool.query(
      "UPDATE users SET profile_picture = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
      [base64Image, user.id]
    );

    return NextResponse.json({ 
      message: "Profile picture updated successfully",
      profile_picture: base64Image
    });
  } catch (err: any) {
    console.error("Profile picture upload error:", err);
    return NextResponse.json({ 
      error: err.message || "Internal server error" 
    }, { status: 500 });
  }
}