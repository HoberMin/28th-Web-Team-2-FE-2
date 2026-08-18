"use client";

/**
 * 서버가 state·nonce를 만든 뒤 카카오 인증 화면으로 보낸다.
 * REST 키와 클라이언트 시크릿은 BFF에만 있고 브라우저 번들에는 들어오지 않는다.
 */
export function startKakaoLogin(): void {
  window.location.assign("/api/auth/kakao/start");
}
