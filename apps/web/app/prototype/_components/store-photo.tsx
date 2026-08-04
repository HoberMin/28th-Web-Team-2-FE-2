// 가게 간판·외관 사진 자리 — 상세 화면 최상단.
//
// 왜 필요한가: 목록·지도에서는 가게가 이름 한 줄이지만, 실제로 찾아가는 사람은 간판을 보고
// "여기가 거기"를 확인한다. 상세의 첫 화면이 숫자부터면 그 확인이 안 된다.
//
// ⚠️ 프로토타입에는 실사진이 없다. 사진이 들어올 자리를 **결정적 플레이스홀더**로 채운다 —
// 가게명 해시로 색을 골라 가게마다 다르게 보이되 매번 같은 색이 나온다(랜덤 금지).
// 실서비스에서는 이 컴포넌트만 <Image src={store.photoUrl}>로 바꾸면 된다.

import IconStoreFill from "@karrotmarket/react-monochrome-icon/IconStoreFill";

/** 플레이스홀더 배경 후보 — 토큰 안에서만 고른다(raw hex 금지). */
const TINTS = [
  "bg-bg-brand-weak",
  "bg-bg-positive-weak",
  "bg-bg-neutral-weak",
  "bg-bg-warning-weak",
];

function tintOf(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) % 100_003;
  return TINTS[hash % TINTS.length];
}

export function StorePhoto({ storeName }: { storeName: string }) {
  return (
    <div
      className={`flex h-40 w-full shrink-0 flex-col items-center justify-center gap-1 ${tintOf(storeName)}`}
    >
      <span className="text-fg-neutral-muted [&_svg]:size-8" aria-hidden="true">
        <IconStoreFill />
      </span>
      {/* 사진이 없다는 걸 숨기지 않는다 — 회색 박스만 두면 로딩 실패로 읽힌다 */}
      <span className="text-caption-12-regular text-fg-neutral-muted">가게 사진 준비 중</span>
    </div>
  );
}
