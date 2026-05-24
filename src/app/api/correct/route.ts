import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text || text.trim() === "") {
      return NextResponse.json({ matches: [] });
    }

    // Call LanguageTool free API (advanced spelling, grammar & conjugation analysis)
    const response = await fetch("https://api.languagetool.org/v2/check", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        text: text,
        language: "fr", // French analysis
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: "LanguageTool API error" }, { status: response.status });
    }

    const data = await response.json();
    
    // Return structured matches with suggestions, offsets and explanations
    return NextResponse.json({ matches: data.matches || [] });
  } catch (error) {
    console.error("Error in orthographe correction API:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
