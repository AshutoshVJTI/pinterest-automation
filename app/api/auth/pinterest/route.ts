import { NextResponse } from "next/server";

export async function GET() {
  const PINTEREST_APP_ID = process.env.PINTEREST_APP_ID;
  const REDIRECT_URI = process.env.PINTEREST_REDIRECT_URI;
  
  const scope = "boards:read,pins:read,pins:write";
  const authUrl = `https://www.pinterest.com/oauth/?client_id=${PINTEREST_APP_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=${scope}`;
  
  return NextResponse.json({ authUrl });
} 