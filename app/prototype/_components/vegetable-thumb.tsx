import Image from "next/image";

// 야채 썸네일 — Figma 일러스트(SVG)가 있으면 그것을, 없으면 이모지로 폴백한다.
// 46종 중 일러스트는 8종뿐이라 폴백 경로가 기본값에 가깝다. 한 군데서만 분기하도록 컴포넌트로 묶었다.
// 장식 이미지라 alt=""·aria-hidden — 품목명은 항상 옆 텍스트가 담당한다.
const SIZE = {
  sm: { box: "size-8", px: 32, emoji: "text-[24px]" },
  md: { box: "size-10", px: 40, emoji: "text-[30px]" },
  lg: { box: "size-12", px: 48, emoji: "text-[34px]" },
  xl: { box: "size-16", px: 64, emoji: "text-[44px]" },
  /** 시세 화면(F03) 헤더 카드 전용 — Figma 규격 104px */
  hero: { box: "size-26", px: 104, emoji: "text-[68px]" },
} as const;

export function VegetableThumb({
  image,
  emoji,
  size = "md",
  className = "",
}: {
  image?: string;
  emoji: string;
  size?: keyof typeof SIZE;
  className?: string;
}) {
  const s = SIZE[size];
  return (
    <span className={`flex shrink-0 items-center justify-center ${s.box} ${className}`}>
      {image ? (
        <Image src={image} alt="" width={s.px} height={s.px} className="h-full w-auto object-contain" />
      ) : (
        <span className={`${s.emoji} leading-none`} aria-hidden="true">
          {emoji}
        </span>
      )}
    </span>
  );
}
