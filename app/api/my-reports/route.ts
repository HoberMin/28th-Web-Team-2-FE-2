import { getAccessToken } from "@/app/_lib/api/auth/session";
import { getMyReports } from "@/app/_lib/api/server/my-reports";
import { myReportsApiErrorResponse } from "./_my-reports-error";

// `cookies()`(→ `getAccessToken()`)를 쓰므로 동적이다 — 본인 데이터라 캐싱 대상이 아니다.
export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  const token = await getAccessToken();
  if (!token) {
    return Response.json({ message: "로그인이 필요해요." }, { status: 401 });
  }

  const params = new URL(request.url).searchParams;
  const page = Number(params.get("page") ?? 0);
  const size = Number(params.get("size") ?? 20);
  if (!Number.isSafeInteger(page) || page < 0 || !Number.isSafeInteger(size) || size < 1) {
    return Response.json({ message: "요청이 올바르지 않아요." }, { status: 400 });
  }

  try {
    return Response.json(await getMyReports({ token, page, size }));
  } catch (error) {
    return myReportsApiErrorResponse(error, "요청이 올바르지 않아요.");
  }
}
