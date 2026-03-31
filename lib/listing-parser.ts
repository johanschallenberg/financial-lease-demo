export type ParsedListing = {
  title?: string;
  price?: number;
  imageUrl?: string;
  buildYear?: string;
  mileage?: string;
  sourceUrl: string;
};

function decodeHtmlEntities(input: string): string {
  return input
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&euro;/gi, "€")
    .replace(/&nbsp;/gi, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function stripTags(input: string): string {
  return input.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function matchMeta(html: string, key: string): string | undefined {
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${key}["'][^>]+content=["']([^"']+)["'][^>]*>`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${key}["'][^>]*>`, "i"),
    new RegExp(`<meta[^>]+name=["']${key}["'][^>]+content=["']([^"']+)["'][^>]*>`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${key}["'][^>]*>`, "i"),
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return decodeHtmlEntities(match[1].trim());
  }

  return undefined;
}

function matchTitle(html: string): string | undefined {
  const ogTitle = matchMeta(html, "og:title") || matchMeta(html, "twitter:title");
  if (ogTitle) return ogTitle;

  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (!match?.[1]) return undefined;

  return decodeHtmlEntities(stripTags(match[1]));
}

function parseJsonLdBlocks(html: string): unknown[] {
  const matches = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  const results: unknown[] = [];

  for (const match of matches) {
    const raw = match[1]?.trim();
    if (!raw) continue;

    try {
      results.push(JSON.parse(raw));
    } catch {
      // ignore malformed JSON-LD
    }
  }

  return results;
}

function flattenJsonLd(node: unknown): Record<string, unknown>[] {
  if (!node) return [];
  if (Array.isArray(node)) return node.flatMap(flattenJsonLd);
  if (typeof node !== "object") return [];

  const item = node as Record<string, unknown>;
  const graph = item["@graph"];
  if (graph) return [item, ...flattenJsonLd(graph)];
  return [item];
}

function getAbsoluteUrl(candidate: string | undefined, sourceUrl: string): string | undefined {
  if (!candidate) return undefined;

  try {
    return new URL(candidate, sourceUrl).toString();
  } catch {
    return undefined;
  }
}

function extractPriceFromText(html: string): number | undefined {
  const text = decodeHtmlEntities(stripTags(html));
  const patterns = [
    /€\s?([0-9]{1,3}(?:\.[0-9]{3})*(?:,[0-9]{2})?|[0-9]{4,})/i,
    /EUR\s?([0-9]{1,3}(?:\.[0-9]{3})*(?:,[0-9]{2})?|[0-9]{4,})/i,
    /([0-9]{1,3}(?:\.[0-9]{3})*(?:,[0-9]{2})?)\s?euro/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (!match?.[1]) continue;
    const normalized = match[1].replace(/\./g, "").replace(/,/g, ".");
    const value = Number.parseFloat(normalized);
    if (Number.isFinite(value) && value > 0) return Math.round(value);
  }

  return undefined;
}

function normalizeMileage(value: string): string {
  const clean = value.replace(/[^0-9]/g, "");
  if (!clean) return value;
  return `${Number(clean).toLocaleString("nl-NL")} km`;
}

function extractBuildYearFromText(html: string): string | undefined {
  const text = decodeHtmlEntities(stripTags(html));
  const match = text.match(/\b(19[89]\d|20[0-2]\d|2030)\b/);
  return match?.[1];
}

function extractMileageFromText(html: string): string | undefined {
  const text = decodeHtmlEntities(stripTags(html));
  const patterns = [
    /([0-9]{1,3}(?:[.,][0-9]{3})+)\s?km\b/i,
    /([0-9]{4,6})\s?km\b/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) return normalizeMileage(match[1]);
  }

  return undefined;
}

export function parseListingHtml(html: string, sourceUrl: string): ParsedListing {
  const blocks = parseJsonLdBlocks(html).flatMap(flattenJsonLd);

  let title = matchTitle(html);
  let price: number | undefined;
  const metaPrice = Number(matchMeta(html, "product:price:amount"));
  if (Number.isFinite(metaPrice) && metaPrice > 0) price = Math.round(metaPrice);
  let imageUrl = getAbsoluteUrl(
    matchMeta(html, "og:image") || matchMeta(html, "twitter:image"),
    sourceUrl
  );
  let buildYear: string | undefined;
  let mileage: string | undefined;

  for (const block of blocks) {
    const type = block["@type"];
    const typeValues = Array.isArray(type) ? type.map(String) : [String(type ?? "")];
    const isProductLike = typeValues.some((value) =>
      ["Product", "Car", "Vehicle", "Offer"].includes(value)
    );

    if (!isProductLike) continue;

    if (!title && typeof block.name === "string") title = block.name;

    const image = block.image;
    if (!imageUrl) {
      if (typeof image === "string") imageUrl = getAbsoluteUrl(image, sourceUrl);
      if (Array.isArray(image) && typeof image[0] === "string") {
        imageUrl = getAbsoluteUrl(image[0], sourceUrl);
      }
    }

    const offers = Array.isArray(block.offers) ? block.offers[0] : block.offers;
    if (!price && offers && typeof offers === "object") {
      const offerObj = offers as Record<string, unknown>;
      const rawPrice = offerObj.price;
      const numeric = Number.parseFloat(String(rawPrice ?? ""));
      if (Number.isFinite(numeric) && numeric > 0) price = Math.round(numeric);
    }

    const mileageFromSchema = (block as Record<string, unknown>).mileageFromOdometer;
    if (!mileage && mileageFromSchema && typeof mileageFromSchema === "object") {
      const odo = mileageFromSchema as Record<string, unknown>;
      if (typeof odo.value === "string" || typeof odo.value === "number") {
        mileage = normalizeMileage(String(odo.value));
      }
    }

    const productionDate = (block as Record<string, unknown>).productionDate;
    if (!buildYear && typeof productionDate === "string") {
      const yearMatch = productionDate.match(/\b(19\d{2}|20\d{2})\b/);
      if (yearMatch?.[1]) buildYear = yearMatch[1];
    }
  }

  if (!price || Number.isNaN(price)) price = extractPriceFromText(html);
  if (!buildYear) buildYear = extractBuildYearFromText(html);
  if (!mileage) mileage = extractMileageFromText(html);

  return {
    title,
    price,
    imageUrl,
    buildYear,
    mileage,
    sourceUrl,
  };
}
