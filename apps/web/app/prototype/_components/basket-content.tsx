"use client";

import Link from "next/link";
import Image from "next/image";
import { getBaselineDummy, getVegetable } from "../_lib/vegetables";
import { useBasket, removeFromBasket, setBasketWeight } from "../_lib/basket-store";
import { useReports } from "../_lib/reports-store";
import { useCurrentDistrict } from "../_lib/location";
import { formatNumber, formatWon } from "../_lib/format";

// F07 장바구니 — "장보기 전 예산 계획". 담은 품목의 KAMIS 기준 예상액 vs 동네 최저 제보가 기준 예상액을 비교한다.
// 실 구매 액션은 아님(계획 도구) — 각 행의 "제보하러 가기"가 F03-1 제보 플로우로 연결한다.
export function BasketContent() {
  const items = useBasket();
  const { district } = useCurrentDistrict();
  const districtReports = useReports({ district });

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 px-4 pt-24 text-center">
        <p className="text-body-16-semibold text-fg-neutral">아직 담은 야채가 없어요</p>
        <p className="text-body-14-regular text-fg-neutral-subtle">
          시세 화면에서 살 야채를 담아보세요
        </p>
      </div>
    );
  }

  let totalKamis = 0;
  let totalLowest = 0;

  const rows = items.map((item) => {
    const veg = getVegetable(item.vegetableId);
    if (!veg) return null;

    const kamisPerKg = getBaselineDummy(item.vegetableId).current;
    const reportPrices = districtReports
      .filter((r) => r.vegetableId === item.vegetableId)
      .map((r) => r.pricePerKg);
    const lowestPerKg = reportPrices.length > 0 ? Math.min(...reportPrices) : kamisPerKg;

    const kamisSubtotal = kamisPerKg * item.weightKg;
    const lowestSubtotal = lowestPerKg * item.weightKg;
    totalKamis += kamisSubtotal;
    totalLowest += lowestSubtotal;

    return { veg, item, kamisSubtotal, hasReport: reportPrices.length > 0 };
  });

  const saved = totalKamis - totalLowest;

  return (
    <div className="flex flex-col gap-6 px-4 pt-3 pb-10">
      <section aria-label="예상 총액" className="flex flex-col gap-3 rounded-2xl bg-bg-brand-weak px-5 py-5">
        <div className="flex items-center justify-between text-body-14-regular">
          <span className="text-fg-neutral-subtle">오늘 시세 기준 총액</span>
          <span className="text-fg-neutral">{formatWon(totalKamis)}</span>
        </div>
        <div className="flex items-center justify-between text-body-14-regular">
          <span className="text-fg-neutral-subtle">동네 최저 제보가 기준 총액</span>
          <span className="text-fg-neutral">{formatWon(totalLowest)}</span>
        </div>
        {saved > 0 && (
          <div className="flex items-center justify-between border-t border-bg-brand-weak-pressed pt-3">
            <span className="text-body-14-medium text-fg-brand">동네 최저가로 사면</span>
            <span className="text-body-16-semibold text-fg-positive">{formatNumber(saved)}원 절약 예상</span>
          </div>
        )}
      </section>

      <ul className="flex flex-col gap-2">
        {rows.map((row) => {
          if (!row) return null;
          const { veg, item, kamisSubtotal, hasReport } = row;
          return (
            <li key={veg.id} className="flex flex-col gap-3 rounded-2xl bg-bg-neutral-weak px-4 py-3">
              <div className="flex items-center gap-3">
                <Image src={veg.image} alt="" width={40} height={40} className="size-10 shrink-0 object-contain" />
                <span className="min-w-0 flex-1">
                  <span className="block text-body-16-semibold text-fg-neutral">{veg.name}</span>
                  <span className="block text-caption-12-regular text-fg-neutral-subtle">
                    {formatWon(kamisSubtotal)}
                    {!hasReport && " · 동네 제보 없음(시세로 대체)"}
                  </span>
                </span>
                <div className="flex items-center gap-1 rounded-full bg-bg-layer-default px-1 py-1">
                  <button
                    type="button"
                    aria-label={item.weightKg <= 1 ? `${veg.name} 장바구니에서 빼기` : `${veg.name} 수량 줄이기`}
                    onClick={() => setBasketWeight(veg.id, item.weightKg - 1)}
                    className="flex size-11 -my-2.5 items-center justify-center text-body-16-semibold text-fg-neutral-subtle"
                  >
                    −
                  </button>
                  <span aria-live="polite" className="min-w-8 text-center text-body-14-medium text-fg-neutral">
                    {item.weightKg}kg
                  </span>
                  <button
                    type="button"
                    aria-label={`${veg.name} 수량 늘리기`}
                    onClick={() => setBasketWeight(veg.id, item.weightKg + 1)}
                    className="flex size-11 -my-2.5 items-center justify-center text-body-16-semibold text-fg-neutral-subtle"
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  aria-label={`${veg.name} 장바구니에서 빼기`}
                  onClick={() => removeFromBasket(veg.id)}
                  className="flex min-h-11 items-center text-caption-12-regular text-fg-neutral-subtle underline"
                >
                  삭제
                </button>
              </div>
              <Link
                href={`/prototype/price/${veg.id}`}
                className="text-caption-12-regular text-fg-brand"
              >
                제보하러 가기 →
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
