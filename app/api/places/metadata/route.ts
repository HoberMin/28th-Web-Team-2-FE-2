import { privateJson } from "@/app/api/stores/_api-error";

const ALLOWED_HOSTS = new Set(["place.map.kakao.com", "place.kakao.com"]);

function extractOgImage(html: string): string | null {
  const match = html.match(
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["'][^>]*>/i,
  );
  return match?.[1]?.replaceAll("&amp;", "&") ?? null;
}

export async function GET(request: Request): Promise<Response> {
  const source = new URL(request.url).searchParams.get("url");
  if (!source) return privateJson({ imageUrl: null }, 400);

  let placeUrl: URL;
  try {
    placeUrl = new URL(source);
  } catch {
    return privateJson({ imageUrl: null }, 400);
  }

  if (placeUrl.protocol !== "https:" && placeUrl.protocol !== "http:") {
    return privateJson({ imageUrl: null }, 400);
  }
  if (!ALLOWED_HOSTS.has(placeUrl.hostname)) return privateJson({ imageUrl: null }, 400);

  try {
    const response = await fetch(placeUrl, {
      headers: { accept: "text/html" },
      signal: AbortSignal.timeout(3_000),
      cache: "no-store",
    });
    if (!response.ok) return privateJson({ imageUrl: null });

    const imageUrl = extractOgImage(await response.text());
    return privateJson({ imageUrl });
  } catch {
    return privateJson({ imageUrl: null });
  }
}
