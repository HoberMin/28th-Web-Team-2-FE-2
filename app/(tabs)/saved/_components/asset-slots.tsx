// F04 화면에서 쓰는 **에셋 자리표시**.
//
// Figma의 사진·아이콘 SVG는 코드로 가져올 수 없다 — `download_assets`가 바이트가 아니라
// figma.com 서명 URL을 돌려주고 그 URL을 받는 경로(REST)는 정책상 차단돼 있다(figma-bridge §0-0).
// 그래서 **임의 아이콘을 그리지 않고** `/playground` nav-gnb 스토리와 같은 점선 자리로 둔다.
// 디자이너가 SVG를 레포로 전달하면 이 파일의 내용만 교체하면 된다.
//
// 필요한 에셋 목록:
//   · 야채 사진 110×110      (F04_찜_야채 그리드 썸네일)
//   · icon/heart-fill 24×24  (야채 카드 찜 표시 — 338-8936)
//   · 가게 사진 72×72        (F04_찜_가게 행 썸네일)
//   · icon/heart-fill 23×23  (가게 행 찜 표시 — 가게 행은 23px로 배치돼 있다)

export function VegetablePhotoSlot() {
  return (
    <span className="flex size-full items-center justify-center text-caption-12-regular text-content-disabled">
      사진
    </span>
  );
}

export function StoreThumbnailSlot() {
  return (
    <span className="flex size-full items-center justify-center text-caption-12-regular text-content-disabled">
      사진
    </span>
  );
}

/** 채워진 하트가 들어갈 자리. 찜 목록이므로 언제나 "찜함" 상태다. */
export function HeartFillSlot({ size }: { size: "23" | "24" }) {
  return (
    <span
      className={
        size === "24"
          ? "block size-6 rounded-sm border border-border-primary border-dashed"
          : "block size-5.75 rounded-sm border border-border-primary border-dashed"
      }
    />
  );
}
