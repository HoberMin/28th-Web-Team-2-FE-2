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
      className="flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100"
      style={{ width: size, height: size }}
    >
      <Image src={image} alt="" width={iconSize} height={iconSize} style={{ width: iconSize, height: iconSize }} />
    </span>
  );
}

/**
 * 랭킹 전용 기본 프로필 이미지 — 원형 배경 + 실루엣이 한 장에 합쳐진 에셋이라
 * `ProfileAvatar`처럼 62.5%로 축소해 별도 원형 배경 위에 얹지 않는다(그러면 원 안에
 * 흰 원이 또 뜬다). 랭킹에서 여러 사람이 나란히 뜰 때 야채 아바타 대신 쓴다 — 다른
 * 화면(마이페이지·설정)의 야채 아바타 선택 기능과는 무관하다.
 *
 * variant로 배경색이 갈린다(디자이너 제공 2종) — 포디움은 컬러 스테이지 위에 얹혀서
 * 흰 배경(list용)을 그대로 쓰면 붕 떠 보이고, 리스트는 옅은 회색 배경(rank용)이 카드
 * 배경(bg-neutral-weak)과 거의 같은 톤이라 아바타 윤곽이 안 보인다.
 */
const DEFAULT_AVATAR_BY_VARIANT = {
  list: "/veg/profile-default-list.svg",
  rank: "/veg/profile-default-rank.svg",
} as const;

export function DefaultProfileAvatar({
  size = 64,
  variant = "list",
}: {
  size?: number;
  variant?: keyof typeof DEFAULT_AVATAR_BY_VARIANT;
}) {
  return (
    <Image
      src={DEFAULT_AVATAR_BY_VARIANT[variant]}
      alt=""
      width={size}
      height={size}
      className="shrink-0 rounded-full"
      style={{ width: size, height: size }}
    />
  );
}
