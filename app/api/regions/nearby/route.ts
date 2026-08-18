import { nearbyRegionRequestSchema } from "@/app/_lib/api/schemas/regions";
import { getNearbyRegions } from "@/app/_lib/api/server/regions";
import { regionApiErrorResponse } from "../_api-error";

export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  const searchParams = new URL(request.url).searchParams;
  const latitudeValue = searchParams.get("latitude");
  const longitudeValue = searchParams.get("longitude");
  const parsed = nearbyRegionRequestSchema.safeParse({
    latitude: latitudeValue === null ? Number.NaN : Number(latitudeValue),
    longitude: longitudeValue === null ? Number.NaN : Number(longitudeValue),
  });

  if (!parsed.success) {
    return Response.json({ message: "현재 위치 좌표가 올바르지 않아요." }, { status: 400 });
  }

  try {
    return Response.json(await getNearbyRegions(parsed.data));
  } catch (error) {
    return regionApiErrorResponse(error, "현재 위치 좌표가 올바르지 않아요.");
  }
}
