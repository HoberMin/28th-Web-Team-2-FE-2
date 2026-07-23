// 자격판정 엔진 (기능② 타겟 A) + 추천 필터 (기능① 타겟 B-2).
//
// 원칙(design 기획안):
//  · 결정성 — 나열이 아니라 된다/안된다/조건부로 판정
//  · 추적가능 — 판정마다 어느 자격 축에서 왜 그렇게 됐는지 근거를 남긴다
//
// "조건부"의 의미: 구조화 필드로 자동 판정이 안 되는 조건(특화분야·자유텍스트 추가조건)이 있어
// 자동으로 확정할 수 없는 상태. B-2 노이즈("경계선 지능" 등)가 여기로 떨어지며,
// 근거(reason)에 원문 조건을 그대로 노출해 유저가 즉시 판별하게 한다.

import type {
  EligibilityCriteria,
  IncomeCondition,
  PolicyVerdict,
  VerdictKind,
  VerdictReason,
  YouthPolicy,
} from "@/lib/youth-policy/types";
import { incomeBandRange, type UserProfile } from "@/lib/youth-policy/profile";

function ageRangeText(e: EligibilityCriteria): string {
  const min = e.ageMin !== null ? `만 ${e.ageMin}세` : "";
  const max = e.ageMax !== null ? `만 ${e.ageMax}세` : "";
  if (min && max) return `${min}~${max}`;
  if (min) return `${min} 이상`;
  if (max) return `${max} 이하`;
  return "연령 무관";
}

function incomeRangeText(income: Extract<IncomeCondition, { kind: "범위" }>): string {
  const toManwon = (won: number) => `${Math.round(won / 10_000).toLocaleString()}만원`;
  if (income.minWon !== null && income.maxWon !== null)
    return `연 ${toManwon(income.minWon)}~${toManwon(income.maxWon)}`;
  if (income.maxWon !== null) return `연 ${toManwon(income.maxWon)} 이하`;
  if (income.minWon !== null) return `연 ${toManwon(income.minWon)} 이상`;
  return "소득 기준 있음";
}

export function judgePolicy(policy: YouthPolicy, profile: UserProfile): PolicyVerdict {
  const reasons: VerdictReason[] = [];
  const e = policy.eligibility;

  // 연령
  if (e.ageLimited && (e.ageMin !== null || e.ageMax !== null)) {
    const okMin = e.ageMin === null || profile.age >= e.ageMin;
    const okMax = e.ageMax === null || profile.age <= e.ageMax;
    reasons.push(
      okMin && okMax
        ? { axis: "연령", result: "해당", detail: `대상 ${ageRangeText(e)} · 내 나이 만 ${profile.age}세` }
        : { axis: "연령", result: "비해당", detail: `대상 ${ageRangeText(e)}인데 내 나이 만 ${profile.age}세` },
    );
  }

  // 지역
  if (e.regions.length > 0) {
    reasons.push(
      e.regions.includes(profile.region)
        ? { axis: "지역", result: "해당", detail: `${e.regions.join(", ")} 거주자 대상` }
        : { axis: "지역", result: "비해당", detail: `${e.regions.join(", ")} 거주자만 대상 · 내 지역 ${profile.region}` },
    );
  }

  // 취업상태
  if (!e.employment.includes("제한없음")) {
    reasons.push(
      e.employment.includes(profile.employment)
        ? { axis: "취업상태", result: "해당", detail: `${e.employment.join(", ")} 대상` }
        : { axis: "취업상태", result: "비해당", detail: `${e.employment.join(", ")} 대상 · 내 상태 ${profile.employment}` },
    );
  }

  // 소득 — 사용자의 소득 "구간"과 정책 기준의 겹침으로 판정.
  //   구간이 정책 범위에 완전히 들어가면 해당, 완전히 벗어나면 비해당,
  //   걸쳐 있으면(대표값이면 오답 났을 지점) 조건부로 남겨 유저가 확인하게 한다.
  if (e.income.kind === "범위") {
    const band = incomeBandRange(profile.incomeBand);
    if (band === null) {
      reasons.push({ axis: "소득", result: "조건부", detail: `소득 기준(${incomeRangeText(e.income)}) 있음 · 소득 정보를 입력하지 않음` });
    } else {
      const polMin = e.income.minWon ?? 0;
      const polMax = e.income.maxWon ?? Number.POSITIVE_INFINITY;
      const within = band.minWon >= polMin && band.maxWon <= polMax;
      const noOverlap = band.maxWon < polMin || band.minWon > polMax;
      reasons.push(
        within
          ? { axis: "소득", result: "해당", detail: `소득 기준 ${incomeRangeText(e.income)} 충족` }
          : noOverlap
            ? { axis: "소득", result: "비해당", detail: `소득 기준 ${incomeRangeText(e.income)} · 내 소득 구간이 벗어남` }
            : { axis: "소득", result: "조건부", detail: `소득 기준 ${incomeRangeText(e.income)} · 내 소득 구간과 걸쳐 있어 실제 소득 확인 필요` },
      );
    }
  } else if (e.income.kind === "기타") {
    reasons.push({ axis: "소득", result: "조건부", detail: `소득 조건: ${e.income.note}` });
  }

  // 학력
  if (e.education.length > 0) {
    reasons.push(
      e.education.includes(profile.education)
        ? { axis: "학력", result: "해당", detail: `${e.education.join(", ")} 대상` }
        : { axis: "학력", result: "비해당", detail: `${e.education.join(", ")} 대상 · 내 학력 ${profile.education}` },
    );
  }

  // 특화분야 — 기본 프로필로 확인 불가 → 조건부
  if (e.specialFields.length > 0) {
    reasons.push({ axis: "특화분야", result: "조건부", detail: `${e.specialFields.join(", ")} 대상 여부를 추가로 확인해야 함` });
  }

  // 추가 자유텍스트 조건 → 조건부 (B-2 노이즈 판별의 핵심)
  if (e.extraConditionsText) {
    reasons.push({ axis: "추가조건", result: "조건부", detail: e.extraConditionsText });
  }

  const verdict: VerdictKind = reasons.some((r) => r.result === "비해당")
    ? "비해당"
    : reasons.some((r) => r.result === "조건부")
      ? "조건부"
      : "해당";

  return { policyId: policy.id, verdict, reasons };
}

export interface RankedPolicy {
  policy: YouthPolicy;
  verdict: PolicyVerdict;
}

export interface Recommendation {
  matched: RankedPolicy[];
  conditional: RankedPolicy[];
  excluded: RankedPolicy[];
}

/**
 * 관심 테마로 1차 필터 후 각 공고를 판정해 3분기.
 * - matched(해당): 자신 있게 추천
 * - conditional(조건부): 노이즈 판별 대상 — 근거를 보여주고 유저가 스스로 거른다
 * - excluded(비해당): 기본 숨김 (원하면 펼쳐 봄)
 */
export function recommendPolicies(
  policies: readonly YouthPolicy[],
  profile: UserProfile,
): Recommendation {
  const scoped =
    profile.interests.length > 0
      ? policies.filter((p) => profile.interests.includes(p.theme))
      : [...policies];

  const ranked: RankedPolicy[] = scoped.map((policy) => ({
    policy,
    verdict: judgePolicy(policy, profile),
  }));

  return {
    matched: ranked.filter((r) => r.verdict.verdict === "해당"),
    conditional: ranked.filter((r) => r.verdict.verdict === "조건부"),
    excluded: ranked.filter((r) => r.verdict.verdict === "비해당"),
  };
}
