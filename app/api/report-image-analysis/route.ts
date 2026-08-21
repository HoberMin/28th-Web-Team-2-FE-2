import { ApiError } from "@/app/_lib/api/api-error";
import { getAccessToken } from "@/app/_lib/api/auth/session";
import { imageAnalysisRequestSchema } from "@/app/_lib/api/schemas/image-analysis";
import { analyzeReportImage } from "@/app/_lib/api/server/image-analysis";

// 매 요청이 다른 이미지라 캐싱 대상이 아니고, `cookies()`를 쓰므로 동적이다.
export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<Response> {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ message: "사진 정보가 올바르지 않아요." }, { status: 400 });
  }

  const parsed = imageAnalysisRequestSchema.safeParse(payload);
  if (!parsed.success) {
    return Response.json({ message: "사진 정보가 올바르지 않아요." }, { status: 400 });
  }

  // 스펙에 `security` 선언이 없어 비로그인도 되는 것으로 보이지만, 로그인 상태면 토큰을
  // 그대로 넘긴다. 비회원 경계가 확정되면(`be-요청사항.md` 3번) 여기서 게이트할지 정한다.
  const token = await getAccessToken();

  try {
    return Response.json(await analyzeReportImage({ body: parsed.data, token: token ?? undefined }));
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
    console.error("[report] 사진 인식 실패", {
      kind: error.kind,
      status: error.status,
      endpoint: error.endpoint,
    });
    if (error.kind === "badRequest") {
      return Response.json({ message: "사진에서 값을 읽지 못했어요." }, { status: 400 });
    }
    if (error.kind === "unauthorized") {
      return Response.json({ message: "로그인이 필요해요." }, { status: 401 });
    }
    if (error.kind === "notFound") {
      return Response.json(
        { message: "선택한 품목을 찾지 못했어요. 품목을 다시 선택해 주세요." },
        { status: 404 },
      );
    }
    // 인식은 부가 기능이라 실패해도 사용자가 직접 입력하면 된다 — 화면이 조용히 넘어갈 수
    // 있도록 상태만 정확히 돌려준다.
    const status = error.kind === "network" ? 503 : 502;
    return Response.json(
      { message: "사진을 분석하지 못했어요. 값을 직접 입력해 주세요." },
      { status },
    );
  }
}
