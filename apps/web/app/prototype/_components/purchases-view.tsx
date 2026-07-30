"use client";

import { getVegetable } from "../_lib/vegetables";
import { useMyReports } from "../_lib/reports-store";
import { toSpendingItem } from "../_lib/spending";
import type { PriceMap } from "../_lib/stores";
import { formatDateDot, formatNumber, formatWon } from "../_lib/format";
import type { Report } from "../_lib/types";
import { RepurchaseCard } from "./repurchase-card";
import { EmptyState } from "./empty-state";

// 마이페이지 「구매」 화면 — 라벨을 「구매 내역」이 아니라 「구매」로 둔 이유는 과거 기록뿐 아니라
// 상단의 "살 때 된 야채"(다음 구매 안내, 홈에서 옮겨옴)를 같이 담기 때문이다.
//
// priceMap은 서버(getPriceMap())가 내려준 오늘 시세 — 절약/초과 계산이 홈·시세 화면과 같은
// 기준을 쓰게 한다(예전엔 더미 기준선을 직접 계산해 화면마다 갈렸다, F05 버그 항목).
export function PurchasesView({ todayIso, priceMap }: { todayIso: string; priceMap: PriceMap }) {
  const myReports = useMyReports();
  const purchases = myReports.filter((r) => r.purchased);

  return (
    <div className="flex flex-col gap-6">
      <RepurchaseCard todayIso={todayIso} />
      <PurchaseList reports={purchases} priceMap={priceMap} />
    </div>
  );
}

// 구매 목록 = 제보 시 구매 체크한 것(purchased)만. 절약 총합은 마이페이지 허브의 절약 카드가 담당.
function PurchaseList({ reports, priceMap }: { reports: Report[]; priceMap: PriceMap }) {
  if (reports.length === 0) {
    return (
      <EmptyState>
        아직 구매한 내역이 없어요.
        <br />
        가격을 제보할 때 &quot;샀어요&quot;를 선택하면 여기에 쌓여요.
      </EmptyState>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {reports.map((r) => {
        const veg = getVegetable(r.vegetableId);
        // 산 가격(전체 무게)과 같은 품목 오늘 시세의 차이 → 절약/초과.
        const { saved } = toSpendingItem(r, priceMap);
        const savedPositive = saved >= 0;
        return (
          <li
            key={r.id}
            className="flex items-center justify-between rounded-2xl bg-bg-neutral-weak px-4 py-3"
          >
            <span className="flex min-w-0 flex-col">
              <span className="text-body-16-semibold text-fg-neutral">
                {veg?.name ?? r.vegetableId}{" "}
                <span className="text-body-14-regular text-fg-neutral-muted">{r.weightKg}kg</span>
              </span>
              <span className="text-caption-12-regular text-fg-neutral-muted">
                {formatDateDot(r.createdAt.slice(0, 10))} · {r.district}
              </span>
            </span>
            <span className="flex flex-col items-end">
              <span className="text-body-16-semibold text-fg-neutral">{formatWon(r.price)}</span>
              {saved !== 0 && (
                <span
                  className={`text-caption-12-regular ${savedPositive ? "text-fg-positive" : "text-fg-warning"}`}
                >
                  시세보다 {formatNumber(Math.abs(saved))}원 {savedPositive ? "절약" : "초과"}
                </span>
              )}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
