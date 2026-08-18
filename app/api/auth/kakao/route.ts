// BFF — 카카오 로그인.
//
// 클라이언트는 카카오 SDK로 받은 **idToken만** 여기로 보낸다. Spring 직접 호출은 하지 않는다
// (BFF 우회 = 규약 위반이고, 토큰이 브라우저에 남는다).
//
// 이 라우트가 하는 일: idToken을 Spring에 넘기고 → 돌아온 토큰을
// **우리 도메인 httpOnly 쿠키로 옮겨 심는다.** 응답 본문에는 토큰을 담지 않는다.

import { ApiError } from "@/app/_lib/api/api-error";
import { saveLoginTokens } from "@/app/_lib/api/auth/session";
import { loginRequestSchema } from "@/app/_lib/api/schemas/auth";
import { login } from "@/app/_lib/api/server/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<Response> {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ message: "요청 형식이 올바르지 않아요." }, { status: 400 });
  }

  // Spring 요청 계약을 그대로 재사용한다 — 같은 모양을 두 번 선언하면 갈라진다.
  const parsed = loginRequestSchema.safeParse(payload);
  if (!parsed.success) {
    return Response.json({ message: "idToken이 필요해요." }, { status: 400 });
  }

  try {
    const tokens = await login({ provider: "kakao", idToken: parsed.data.idToken });
    await saveLoginTokens(tokens);

    if (!tokens.refreshToken) {
      // 재발급 수단 없이 accessToken만 있는 상태 — 만료되면 다시 로그인해야 한다.
      console.warn("[auth] 로그인 응답에 refreshToken 쿠키가 없습니다.");
    }

    // TODO(✍️): 신규/기존 회원 구분값이 없어 온보딩 분기를 여기서 못 준다.
    // BE 요청 1번(`농산물-문서/be-요청사항.md`)의 답이 오면 이 응답에 담는다.
    return Response.json({ ok: true });
  } catch (error) {
    if (error instanceof ApiError) {
      // 원인을 뭉개지 않는다 — 전부 502로 내보내면 "카카오 토큰이 틀렸다"와
      // "Spring이 죽었다"가 구분되지 않아 디버깅이 어려워진다.
      console.error("[auth] 카카오 로그인 실패", {
        kind: error.kind,
        status: error.status,
        endpoint: error.endpoint,
      });

      if (error.isAuthExpired || error.kind === "forbidden") {
        return Response.json({ message: "로그인 정보가 올바르지 않아요." }, { status: 401 });
      }
      // 400은 재로그인으로 안 풀린다 — 우리 body가 위 loginRequestSchema를 이미 통과했으므로
      // Spring이 400을 준다면 대개 필드명·경로 계약 불일치, 즉 **우리 버그**다.
      // 이걸 401로 보내면 사용자가 재로그인만 반복하게 된다.
      if (error.kind === "badRequest") {
        return Response.json({ message: "로그인 요청이 처리되지 않았어요." }, { status: 400 });
      }
      return Response.json(
        { message: "로그인에 실패했어요. 잠시 후 다시 시도해 주세요." },
        { status: 502 },
      );
    }
    throw error;
  }
}
