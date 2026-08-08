// F04 화면에서 **대응 에셋이 아직 없는 자리**만 남긴 자리표시.
//
// 야채 사진·야채 카드 하트·가게 행 하트는 디자이너가 Figma Plugin API로 export해 전달한
// `public/figma/design-library/` 에셋으로 교체했다(`@/app/_lib/figma-asset`).
//
// 남은 자리: **가게 행 썸네일 72×72**. Design Library에 가게 사진 에셋이 없다.
// `images/story-thumbnail.png`가 크기상 가장 가깝지만 스토리 카드용 이미지라 가게 사진 규격이
// 아니어서 억지로 쓰지 않았다. 디자이너가 가게 사진 에셋을 전달하면 이 파일을 지우고 호출부를
// `FigmaImage`로 바꾸면 된다.
//
// (참고: 과거 주석의 "`download_assets`가 정책상 차단돼 있다"는 서술은 사실이 아니다.
//  MCP 도구 자체는 정상이고, 도구가 돌려주는 figma.com 서명 URL을 내려받는 `curl` 경로가
//  deny 규칙에 걸린다 — figma-bridge §0-0. 이번엔 디자이너가 직접 export해 레포로 전달했다.)

export function StoreThumbnailSlot() {
  return (
    <span className="flex size-full items-center justify-center text-caption-12-regular text-content-disabled">
      사진
    </span>
  );
}
