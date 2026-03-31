import { NextRequest, NextResponse } from "next/server";
import { parseListingHtml } from "@/lib/listing-parser";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const url = typeof body?.url === "string" ? body.url.trim() : "";

    if (!url) {
      return NextResponse.json({ error: "Geen URL ontvangen." }, { status: 400 });
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return NextResponse.json({ error: "Ongeldige URL." }, { status: 400 });
    }

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return NextResponse.json({ error: "Alleen http en https URLs zijn toegestaan." }, { status: 400 });
    }

    const response = await fetch(parsedUrl.toString(), {
      headers: {
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "accept-language": "nl-NL,nl;q=0.9,en;q=0.8",
        "cache-control": "no-cache",
      },
      redirect: "follow",
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          error: `De advertentie kon niet worden opgehaald (${response.status}).`,
        },
        { status: 502 }
      );
    }

    const html = await response.text();
    const listing = parseListingHtml(html, response.url || parsedUrl.toString());

    if (!listing.title && !listing.price && !listing.imageUrl) {
      return NextResponse.json(
        {
          error:
            "We konden op deze pagina geen bruikbare autogegevens vinden. Probeer handmatige invoer of een andere advertentie.",
        },
        { status: 422 }
      );
    }

    return NextResponse.json({ listing });
  } catch (error) {
    console.error("parse-listing error", error);
    return NextResponse.json(
      {
        error:
          "Er ging iets mis bij het uitlezen van de advertentie. Probeer het opnieuw of gebruik handmatige invoer.",
      },
      { status: 500 }
    );
  }
}
