"use client";

// 카카오 로그인 — **목업**이다. 프로토타입(UT·디자이너 확인)이라 실제 OAuth를 붙이지 않는다.
//
// 실제로 붙일 때 바뀌는 곳은 이 파일 하나다: `startKakaoLogin()`이 카카오 인증 페이지로 리다이렉트하고,
// 돌아온 code를 BFF(`app/api/auth/kakao`)에서 토큰으로 교환한 뒤 세션을 심으면 된다.
// 그때도 REST 키·시크릿은 서버까지만 둔다(conventions #7). 화면 코드는 이 함수 시그니처만 보면 된다.
//
// 카카오 이름을 닉네임으로 가져오지 않는다(F00-0 정책) → 성공 응답에 프로필이 없는 게 정상이다.

/** 인증 화면이 떠 있는 것처럼 보이는 시간. 즉시 성공하면 로딩 상태를 확인할 수 없다. */
const MOCK_DELAY_MS = 900;

export interface KakaoLoginResult {
  /** 신규 회원 여부 — 신규면 닉네임(F00-1)부터, 기존이면 바로 홈. */
  isNew: boolean;
}

/**
 * 카카오 인증 시작(목업). 항상 신규 회원으로 성공한다.
 *
 * 취소·실패는 목업에서 재현하지 않는다. 다만 화면 쪽에는 두 경로가 살아 있다
 * (거부 = 에러 없이 복귀 / 실패 = 버튼 아래 한 줄 + 재시도) — 실제 OAuth를 붙이는 순간
 * 이 함수가 reject하면 그대로 동작한다.
 */
export function startKakaoLogin(): Promise<KakaoLoginResult> {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve({ isNew: true }), MOCK_DELAY_MS);
  });
}
