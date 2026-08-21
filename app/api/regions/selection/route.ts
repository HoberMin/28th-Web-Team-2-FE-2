import { ApiError } from "@/app/_lib/api/api-error";
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
  } catch (error) {
    // 원인을 남기지 않으면 배포본 502를 Vercel 로그로 추적할 수 없다.
    // 토큰·본문은 담지 않고 분류와 대상만 남긴다(`regions/_api-error.ts`와 같은 방침).
    console.error("[regions] 선택 지역 좌표 확보 실패", {
      kind: error instanceof ApiError ? error.kind : "unknown",
      status: error instanceof ApiError ? error.status : undefined,
      endpoint: error instanceof ApiError ? error.endpoint : undefined,
    });
    return Response.json(
      { message: "동네 좌표를 불러오지 못했어요. 동네를 다시 선택해 주세요." },
      { status: 502 },
    );
  }
}
