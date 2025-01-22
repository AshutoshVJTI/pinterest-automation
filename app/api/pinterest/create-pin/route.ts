import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { imageUrl, title, description } = await req.json();
    
    // Get access token from your storage/database
    const accessToken = ""; // TODO: Implement token storage and retrieval
    
    const response = await fetch("https://api.pinterest.com/v5/pins", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title,
        description,
        media_source: {
          source_type: "image_url",
          url: imageUrl
        },
        board_id: "YOUR_BOARD_ID" // TODO: Allow user to select board
      })
    });

    if (!response.ok) {
      throw new Error("Failed to create pin");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating pin:', error);
    return NextResponse.json({ error: "Failed to create pin" }, { status: 500 });
  }
} 