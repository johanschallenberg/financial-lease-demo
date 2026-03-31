import { NextRequest, NextResponse } from "next/server";
import { parseListingHtml } from "@/lib/listing-parser";

function pickHtmlSignals(html: string) {
  const normalized = html.replace(/\s+/g, " ");

  return {
    hasBmwX7: /BMW\s+X7/i.test(normalized),
    hasPrice: /€\s*[0-9]{1,3}(?:\.[0-9]{3})*(?:,[0-9]{2})?/i.test(normalized),
    hasSpecificPrice: /€\s*59\.995/i.test(normalized),
    hasBuildYear2020: /\b2020\b/.test(normalized),
    hasMileage: /139[.,]583\s*km/i.test(normalized),
    hasVehicleImageText: /voertuig afbeelding/i.test(normalized),
    hasOgImage: /property=["']og:image["']/i.test(html),
    hasJsonLd: /application\/ld\+json/i.test(html),
    titleTag: (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "")
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 200),
    firstH1: (html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || "")
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 200),
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const url = typeof body?.url === "string" ? body.url.trim() : "";
    const debug = body?.debug === true;

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
      return NextResponse.json(
        { error: "Alleen http en https URLs zijn toegestaan." },
        { status: 400 }
      );
    }

    const response = await fetch(parsedUrl.toString(), {
      headers: {
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
        accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "accept-language": "nl-NL,nl;q=0.9,en;q=0.8",
        "cache-control": "no-cache",
        pragma: "no-cache",
      },
      redirect: "follow",
      cache: "no-store",
    });

    const finalUrl = response.url || parsedUrl.toString();
    const contentType = response.headers.get("content-type") || "";
    const html = await response.text();

    const listing = parseListingHtml(html, finalUrl);

    const diagnostics = {
      requestedUrl: parsedUrl.toString(),
      finalUrl,
      status: response.status,
      ok: response.ok,
      contentType,
      htmlLength: html.length,
      htmlSignals: pickHtmlSignals(html),
      parsedListing: listing,
      htmlPreview: html.slice(0, 2500),
    };

    if (!response.ok) {
      return NextResponse.json(
        {
          error: `De advertentie kon niet worden opgehaald (${response.status}).`,
          ...(debug ? { diagnostics } : {}),
        },
        { status: 502 }
      );
    }

    if (!listing.title && !listing.price && !listing.imageUrl) {
      return NextResponse.json(
        {
          error:
            "We konden op deze pagina geen bruikbare autogegevens vinden. Probeer handmatige invoer of een andere advertentie.",
          ...(debug ? { diagnostics } : {}),
        },
        { status: 422 }
      );
    }

    return NextResponse.json({
      listing,
      ...(debug ? { diagnostics } : {}),
    });
  } catch (error) {
    console.error("parse-listing error", error);

    return NextResponse.json(
      {
        error:
          "Er ging iets mis bij het uitlezen van de advertentie. Probeer het opnieuw of gebruik handmatige invoer.",
        details:
          error instanceof Error ? error.message : "Onbekende fout in parse route.",
      },
      { status: 500 }
    );
  }
}
