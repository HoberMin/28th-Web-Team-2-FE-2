import Image from "next/image";

// 프로필 아바타 — 전원 같은 고정 아이콘이던 문제를 최소 비용으로 푼다.
// 새 에셋을 만들지 않고 이미 있는 야채 일러스트 8종(Figma 제공분)을 아바타 후보로 재사용한다.
// 값을 안 고르면(avatarId 없음/빈 문자열) 기존 기본 아이콘을 그대로 보여준다(회귀 없음).
export const AVATAR_OPTIONS: { id: string; image: string; label: string }[] = [
  { id: "potato", image: "/veg/potato.svg", label: "감자" },
  { id: "sweet-potato", image: "/veg/sweet-potato.svg", label: "고구마" },
  { id: "garlic", image: "/veg/garlic.svg", label: "마늘" },
  { id: "onion", image: "/veg/onion.svg", label: "양파" },
  { id: "carrot", image: "/veg/carrot.svg", label: "당근" },
  { id: "tomato", image: "/veg/tomato.svg", label: "토마토" },
  { id: "bell-pepper", image: "/veg/bell-pepper.svg", label: "피망" },
  { id: "cucumber", image: "/veg/cucumber.svg", label: "오이" },
];

const DEFAULT_AVATAR_IMAGE = "/veg/mypage.svg";

export function getAvatarImage(avatarId?: string): string {
  return AVATAR_OPTIONS.find((a) => a.id === avatarId)?.image ?? DEFAULT_AVATAR_IMAGE;
}

export function ProfileAvatar({ avatarId, size = 64 }: { avatarId?: string; size?: number }) {
  const image = getAvatarImage(avatarId);
  const iconSize = Math.round(size * 0.625);
  return (
    <span
      className="flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-bg-neutral-weak"
      style={{ width: size, height: size }}
    >
      <Image src={image} alt="" width={iconSize} height={iconSize} style={{ width: iconSize, height: iconSize }} />
    </span>
  );
}
