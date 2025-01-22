import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "No code provided" }, { status: 400 });
  }

  try {
    const tokenResponse = await fetch("https://api.pinterest.com/v5/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(
          `${process.env.PINTEREST_APP_ID}:${process.env.PINTEREST_APP_SECRET}`
        ).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.PINTEREST_REDIRECT_URI!,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      throw new Error(tokenData.message || "Failed to get access token");
    }

    // Here you would typically store the token in your database
    // For now, we'll return it to the client
    return NextResponse.json({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
    });
  } catch (error) {
    console.error("Pinterest OAuth Error:", error);
    return NextResponse.json(
      { error: "Failed to authenticate with Pinterest" },
      { status: 500 }
    );
  }
} 