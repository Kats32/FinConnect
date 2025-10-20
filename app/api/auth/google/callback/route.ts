import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const savedState = typeof window === "undefined" ? null : sessionStorage.getItem("google_oauth_state"); 
    // sessionStorage isn't accessible on server, so normally you'd verify via cookie instead.

    if (!code) {
        return NextResponse.redirect(new URL("/login?error=missing_code", req.url));
    }

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: process.env.NEXT_PUBLIC_REDIRECT_URI!,
        grant_type: "authorization_code",
        }),
    });

    const data = await tokenRes.json();
    if (!tokenRes.ok) {
        console.error("Google token exchange failed:", data);
        return NextResponse.redirect(new URL("/login?error=token_exchange_failed", req.url));
    }

    // Get user info
    const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${data.access_token}` },
    });
    const user = await userRes.json();

    console.log("Google user:", user);

    // You can now store user in DB or session
    const response = NextResponse.redirect(new URL("/", req.url));
  // For simplicity, set a cookie
    response.cookies.set("user_email", user.email, { httpOnly: false });
    response.cookies.set(
        "user_name",
        user.name || `${user.given_name || ""} ${user.family_name || ""}`.trim() || user.email,
        { httpOnly: false }
    );
    return response;
}
