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
    
    console.log("Fetching preferences for user ID:", user.id);

    const result = await pool.query(
      "SELECT * FROM user_preferences WHERE user_id = $1",
      [user.id]
    );

    // Default preferences if none exist
    const preferences = result.rows[0] || {
      theme: 'dark',
      notifications_enabled: true,
      language: 'en',
      currency: 'USD',
      email_notifications: true,
      push_notifications: true,
    };

    return NextResponse.json({ preferences });
  } catch (err: any) {
    console.error("Preferences GET error:", err);
    return NextResponse.json({ 
      error: err.message || "Internal server error" 
    }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    const preferences = await req.json();

    console.log("Updating preferences for user ID:", user.id, preferences);

    // Validate preferences
    const validThemes = ['dark', 'light', 'system'];
    const validLanguages = ['en', 'es', 'fr', 'de'];
    const validCurrencies = ['USD', 'EUR', 'GBP', 'JPY'];

    if (!validThemes.includes(preferences.theme)) {
      return NextResponse.json({ error: "Invalid theme" }, { status: 400 });
    }

    if (!validLanguages.includes(preferences.language)) {
      return NextResponse.json({ error: "Invalid language" }, { status: 400 });
    }

    if (!validCurrencies.includes(preferences.currency)) {
      return NextResponse.json({ error: "Invalid currency" }, { status: 400 });
    }

    // Check if preferences already exist
    const existing = await pool.query(
      "SELECT id FROM user_preferences WHERE user_id = $1",
      [user.id]
    );

    if (existing.rows.length > 0) {
      // Update existing preferences
      await pool.query(
        `UPDATE user_preferences 
         SET theme = $1, notifications_enabled = $2, language = $3, currency = $4, 
             email_notifications = $5, push_notifications = $6, updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $7`,
        [
          preferences.theme,
          preferences.notifications_enabled,
          preferences.language,
          preferences.currency,
          preferences.email_notifications,
          preferences.push_notifications,
          user.id
        ]
      );
    } else {
      // Insert new preferences
      await pool.query(
        `INSERT INTO user_preferences 
         (user_id, theme, notifications_enabled, language, currency, email_notifications, push_notifications)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          user.id,
          preferences.theme,
          preferences.notifications_enabled,
          preferences.language,
          preferences.currency,
          preferences.email_notifications,
          preferences.push_notifications
        ]
      );
    }

    return NextResponse.json({ 
      message: "Preferences updated successfully",
      preferences
    });
  } catch (err: any) {
    console.error("Preferences PUT error:", err);
    return NextResponse.json({ 
      error: err.message || "Internal server error" 
    }, { status: 500 });
  }
}