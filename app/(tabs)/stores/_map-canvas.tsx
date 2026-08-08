// 지도 캔버스 — **이번 사이클은 플레이스홀더다.**
//
// Figma의 `Rectangle 24/25`(y 132~765)는 실제 지도 영역이 아니라 지도 스크린샷 PNG를 깐
// 사각형이다. 파란 현위치 점도 그 PNG에 구워져 있어서, 코드에서는 배경과 점을 각각 그려야 한다.
//
// ⚠️ **전체화면으로 깐다** — Figma는 y 132~765의 633px 밴드지만 카카오맵을 붙이면 지도는
//    화면을 꽉 채우고 검색·배지·시트가 그 위에 뜨는 게 표준이다. 밴드로 만들면 지도 위아래에
//    흰 띠가 남아 오버레이 구조 전체가 달라진다. 감사에서 미결로 남은 항목이라 여기 남긴다
//    (디자이너 확인 필요).
//
// ⚠️ 실제 SDK는 붙이지 않았다. 붙일 때는 `app/_lib/kakao-map.ts`의 `loadKakaoSdk(appKey)`를
//    이 컴포넌트 안에서 부르면 된다 — 키가 없거나 로드가 실패하면 `null`을 돌려주므로
//    이 플레이스홀더가 그대로 폴백이 된다. 앱키는 도메인 제한이 걸린 공개 키(NEXT_PUBLIC_)이지
//    시크릿이 아니다(conventions #7 대상 아님).
//
// ⚠️ 현위치 점은 **Figma에 규격이 없다**(래스터에 구워져 있어 색·크기를 잴 수 없다).
//    토큰 안에서 가장 가까운 값(blue/500 + 흰 테두리)으로 임시 구현했다 — 디자이너 확인 항목.

export function MapCanvas() {
  return (
    <div aria-hidden="true" className="absolute inset-0 bg-surface-secondary">
      {/* 지도 타일이 들어올 자리. 실제 SDK가 붙으면 이 요소가 지도 컨테이너가 된다. */}
      <div className="absolute inset-0 flex items-center justify-center">
        <p className="text-body-14-regular text-content-disabled">지도 준비 중</p>
      </div>
      {/* 현위치 — 지도 중심. 임시 구현(위 ⚠️ 참고). */}
      <span className="absolute top-1/2 left-1/2 flex size-4 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-surface-primary bg-blue-500 shadow-floating" />
    </div>
  );
}
