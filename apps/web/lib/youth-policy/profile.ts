// UT 프로토타입에서 수집하는 사용자 프로필 + 설문 선택지.
// 기획 원칙 1(정보 최소수집): 대부분 공고가 공유하는 공통 5축만 온보딩에서 1회 수집.

import type { PolicyTheme } from "@/lib/youth-policy/types";

export type RegionChoice = "서울특별시" | "경기도" | "기타 지역";
export type EmploymentChoice =
  | "재직자"
  | "미취업자"
  | "자영업자"
  | "프리랜서"
  | "(예비)창업자"
  | "영농종사자";
export type EducationChoice = "고졸 이하" | "대학 재학" | "대학 졸업";
export type IncomeBand = "무관" | "2400이하" | "2400_3600" | "3600초과";

// 카테고리(관심 테마)는 프로필이 아니다 — 자격과 무관한 "결과 필터"라 여기서 뺀다.
export interface UserProfile {
  nickname: string;
  age: number;
  region: RegionChoice;
  employment: EmploymentChoice;
  incomeBand: IncomeBand;
  education: EducationChoice;
}

export const REGION_OPTIONS: readonly RegionChoice[] = [
  "서울특별시",
  "경기도",
  "기타 지역",
];

export const EMPLOYMENT_OPTIONS: readonly EmploymentChoice[] = [
  "재직자",
  "미취업자",
  "자영업자",
  "프리랜서",
  "(예비)창업자",
  "영농종사자",
];

export const EDUCATION_OPTIONS: readonly EducationChoice[] = [
  "고졸 이하",
  "대학 재학",
  "대학 졸업",
];

// 밴드는 점이 아니라 구간이다. 정책 소득 기준과 이 구간의 겹침으로 판정한다
// (대표값 1점으로 환원하면 기준선이 구간 내부에 있을 때 확신에 찬 오답이 난다).
export const INCOME_OPTIONS: readonly {
  value: IncomeBand;
  label: string;
  /** 밴드 구간 [minWon, maxWon]. minWon=null → 하한 없음, maxWon=null → 상한 없음, 둘 다 null → 무관. */
  minWon: number | null;
  maxWon: number | null;
}[] = [
  { value: "무관", label: "잘 모르겠어요 / 무관", minWon: null, maxWon: null },
  { value: "2400이하", label: "연 2,400만원 이하", minWon: 0, maxWon: 24_000_000 },
  { value: "2400_3600", label: "연 2,400~3,600만원", minWon: 24_000_000, maxWon: 36_000_000 },
  { value: "3600초과", label: "연 3,600만원 초과", minWon: 36_000_000, maxWon: null },
];

export const THEME_OPTIONS: readonly PolicyTheme[] = [
  "일자리",
  "주거",
  "교육",
  "복지문화",
  "참여권리",
];

/** 밴드의 소득 구간. "무관"이면 null(소득 정보 없음). */
export function incomeBandRange(
  band: IncomeBand,
): { minWon: number; maxWon: number } | null {
  const o = INCOME_OPTIONS.find((x) => x.value === band);
  if (!o || (o.minWon === null && o.maxWon === null)) return null;
  return {
    minWon: o.minWon ?? 0,
    maxWon: o.maxWon ?? Number.POSITIVE_INFINITY,
  };
}

/** 세션 데이터가 판정 가능한 완전한 프로필인지 좁힌다. */
export function isCompleteProfile(
  data: Partial<UserProfile> | null,
): data is UserProfile {
  return (
    !!data &&
    typeof data.nickname === "string" &&
    data.nickname.length > 0 &&
    typeof data.age === "number" &&
    Number.isFinite(data.age) &&
    !!data.region &&
    !!data.employment &&
    !!data.incomeBand &&
    !!data.education
  );
}
