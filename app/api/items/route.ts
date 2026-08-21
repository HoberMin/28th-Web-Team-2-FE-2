import { getAccessToken } from "@/app/_lib/api/auth/session";
import { ApiError } from "@/app/_lib/api/api-error";
import { itemPageRequestSchema } from "@/app/_lib/api/schemas/items";
import { getItemsWithTemporaryFallback } from "@/app/_lib/api/server/items-fallback";
import { getSelectedRegionId } from "@/app/_lib/api/server/selected-region";

export const dynamic = "force-dynamic";

const PRIVATE_NO_STORE_HEADERS = {
  "Cache-Control": "private, no-store",
} as const;

function privateJson(body: unknown, status = 200): Response {
  return Response.json(body, { status, headers: PRIVATE_NO_STORE_HEADERS });
}

function itemsApiErrorResponse(error: unknown): Response {
  if (error instanceof ApiError) {
    console.error("[items-bff] upstream request failed", {
      kind: error.kind,
      status: error.status,
      endpoint: error.endpoint,
    });

    if (error.kind === "unauthorized") {
      return privateJson({ message: "로그인이 만료됐어요." }, 401);
    }
    if (error.kind === "badRequest") {
      return privateJson({ message: "야채 조회 조건을 확인해 주세요." }, 400);
    }
    if (error.kind === "network") {
      return privateJson({ message: "시세 조회 서버에 연결할 수 없어요." }, 503);
    }
    return privateJson({ message: "야채 시세를 불러오지 못했어요." }, 502);
  }

  console.error("[items-bff] unexpected error");
  return privateJson({ message: "야채 시세를 불러오지 못했어요." }, 500);
}

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const parsed = itemPageRequestSchema.safeParse({
    page: searchParams.get("page") ?? undefined,
    size: searchParams.get("size") ?? undefined,
    sort: searchParams.get("sort") ?? undefined,
    keyword: searchParams.get("keyword") ?? undefined,
    category: searchParams.get("category") ?? undefined,
  });

  if (!parsed.success) {
    return privateJson({ message: "야채 조회 조건을 확인해 주세요." }, 400);
  }

  const [token, regionId] = await Promise.all([getAccessToken(), getSelectedRegionId()]);
  if (!regionId) {
    return privateJson({ message: "동네를 먼저 선택해 주세요." }, 400);
  }

  try {
    const { page } = await getItemsWithTemporaryFallback({
      ...parsed.data,
      regionId,
      favoriteOnly: false,
      token,
    }, { includeMonthlyComparison: true });
    return privateJson(page);
  } catch (error) {
    return itemsApiErrorResponse(error);
  }
}
