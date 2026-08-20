import { regionSchema } from "@/app/_lib/api/schemas/regions";
import {
  resolveSelectedRegionCoordinates,
  saveSelectedRegion,
} from "@/app/_lib/api/server/selected-region";

export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<Response> {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ message: "선택한 동네 정보가 올바르지 않아요." }, { status: 400 });
  }

  const parsed = regionSchema.safeParse(payload);
  if (!parsed.success) {
    return Response.json({ message: "선택한 동네 정보가 올바르지 않아요." }, { status: 400 });
  }

  try {
    const resolved = await resolveSelectedRegionCoordinates(parsed.data);
    if (!resolved) {
      return Response.json(
        { message: "동네 좌표를 확인하지 못했어요. 동네를 다시 선택해 주세요." },
        { status: 422 },
      );
    }
    await saveSelectedRegion(resolved);
    return Response.json(resolved);
  } catch {
    return Response.json(
      { message: "동네 좌표를 불러오지 못했어요. 동네를 다시 선택해 주세요." },
      { status: 502 },
    );
  }
}
