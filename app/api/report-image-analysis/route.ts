import { ApiError } from "@/app/_lib/api/api-error";
import { getAccessToken } from "@/app/_lib/api/auth/session";
import { imageAnalysisRequestSchema } from "@/app/_lib/api/schemas/image-analysis";
import { analyzeReportImage } from "@/app/_lib/api/server/image-analysis";
import { photoAnalysisMessage } from "@/app/_lib/report-photo-messages";

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
    // 인식은 부가 기능이라 실패해도 사용자가 직접 입력하면 된다 — 화면이 조용히 넘어갈 수
    // 있도록 상태를 정확히 돌려준다. 문구는 폼과 같은 함수로 만든다
    // (`app/_lib/report-photo-messages.ts`) — 지금 폼은 body의 `message`를 읽지 않고 status로
    // 직접 계산하지만, 읽기로 바뀌어도 안내가 갈리지 않게 하려는 것이다.
    const status = statusFor(error.kind);
    return Response.json({ message: photoAnalysisMessage(status) }, { status });
  }
}

/** ApiError.kind → 이 BFF가 클라이언트에 돌려줄 status. 분기는 status로만 한다. */
function statusFor(kind: ApiError["kind"]): number {
  if (kind === "badRequest") return 400;
  if (kind === "unauthorized") return 401;
  if (kind === "notFound") return 404;
  return kind === "network" ? 503 : 502;
}
