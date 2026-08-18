// BFF — 카카오 로그인.
//
// 클라이언트는 카카오 SDK로 받은 **idToken만** 여기로 보낸다. Spring 직접 호출은 하지 않는다
// (BFF 우회 = 규약 위반이고, 토큰이 브라우저에 남는다).
//
// 이 라우트가 하는 일: idToken을 Spring에 넘기고 → 돌아온 토큰을
// **우리 도메인 httpOnly 쿠키로 옮겨 심는다.** 응답 본문에는 토큰을 담지 않는다.

import { z } from "zod";
import { saveTokens } from "@/app/_lib/api/auth/session";
import { ApiError } from "@/app/_lib/api/api-error";
import { login } from "@/app/_lib/api/server/auth";

export const dynamic = "force-dynamic";

const bodySchema = z.object({ idToken: z.string().min(1) });

export async function POST(request: Request): Promise<Response> {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ message: "요청 형식이 올바르지 않아요." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(payload);
  if (!parsed.success) {
    return Response.json({ message: "idToken이 필요해요." }, { status: 400 });
  }

  try {
    const tokens = await login({ provider: "kakao", idToken: parsed.data.idToken });
    await saveTokens(tokens);

    if (!tokens.refreshToken) {
      // 재발급 수단 없이 accessToken만 있는 상태 — 만료되면 다시 로그인해야 한다.
      console.warn("[auth] 로그인 응답에 refreshToken 쿠키가 없습니다.");
    }

    // TODO(✍️): 신규/기존 회원 구분값이 없어 온보딩 분기를 여기서 못 준다.
    // BE 요청 1번(`농산물-문서/be-요청사항.md`)의 답이 오면 이 응답에 담는다.
    return Response.json({ ok: true });
  } catch (error) {
    if (error instanceof ApiError) {
      const status = error.kind === "unauthorized" ? 401 : 502;
      return Response.json({ message: "로그인에 실패했어요. 다시 시도해 주세요." }, { status });
    }
    throw error;
  }
}
