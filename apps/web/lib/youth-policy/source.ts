// 더미 데이터 진입점. 실제 API 연동 시 이 함수 내부만 BFF fetch로 교체하면 된다.

import { dummyPoliciesRaw } from "@/lib/youth-policy/dummy";
import { normalizePolicies, normalizePolicy } from "@/lib/youth-policy/normalize";
import type { YouthPolicy } from "@/lib/youth-policy/types";

export function getAllPolicies(): YouthPolicy[] {
  return normalizePolicies(dummyPoliciesRaw);
}

export function getPolicyById(id: string): YouthPolicy | null {
  const raw = dummyPoliciesRaw.find((p) => p.plcyNo === id);
  return raw ? normalizePolicy(raw) : null;
}
