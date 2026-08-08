// 지도 캔버스 — **이번 사이클은 플레이스홀더다.**
//
// Figma의 `Rectangle 24/25`(y 132~765)는 실제 지도 영역이 아니라 지도 스크린샷 PNG를 깐
// 사각형이다. 파란 현위치 점도 그 PNG에 구워져 있어서, 코드에서는 배경과 점을 각각 그려야 한다.
//
// ⚠️ **전체화면으로 깐다 — 디자이너 확인 대기 항목이다.**
//    Figma의 y 132~765(633px)는 어긋난 값이 아니라 정확히 계산된 구획이다:
//    844 − 44(Status Bar) − 88(흰 검색 헤더) − 79(GNB) = 633. 즉 밴드로 만들어도
//    위아래에 흰 띠가 남지 않는다(예전 주석의 "흰 띠가 남는다"는 서술은 사실이 아니라 지웠다).
//    그럼에도 전체화면으로 가는 이유는 두 가지다 — ① 카카오맵 SDK를 붙이는 표준 형태가
//    컨테이너를 꽉 채우고 컨트롤을 그 위에 띄우는 것이고, ② 그래야 지도 면적이 넓어져
//    핀치·드래그로 실제 탐색이 되는 화면이 된다.
//    Figma 구획을 그대로 따를지(밴드) 지도 면적을 벌지(전체화면)는 디자이너 결정 사항이다.
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
