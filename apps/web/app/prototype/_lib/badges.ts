// 뱃지 — 구매인증(제보) 원동력. 저장 없이 제보/구매 건수로 그때그때 계산.

export interface Badge {
  id: string;
  label: string;
  description: string;
  earned: boolean;
}

const REPORT_TIERS = [
  { count: 1, id: "sprout", label: "새싹 이웃", description: "첫 제보를 남겼어요" },
  { count: 5, id: "steady", label: "알뜰 이웃", description: "제보 5건을 채웠어요" },
  { count: 15, id: "veteran", label: "동네 터줏대감", description: "제보 15건을 채웠어요" },
] as const;

const PURCHASE_TIERS = [
  { count: 3, id: "buyer", label: "실제가 인증러", description: "구매 인증 3건을 남겼어요" },
] as const;

export function getBadges(reportCount: number, purchaseCount: number): Badge[] {
  const reportBadges = REPORT_TIERS.map((t) => ({
    id: t.id,
    label: t.label,
    description: t.description,
    earned: reportCount >= t.count,
  }));
  const purchaseBadges = PURCHASE_TIERS.map((t) => ({
    id: t.id,
    label: t.label,
    description: t.description,
    earned: purchaseCount >= t.count,
  }));
  return [...reportBadges, ...purchaseBadges];
}
