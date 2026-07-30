"use client";

import Link from "next/link";
import { ActionButton } from "seed-design/ui/action-button";
import { VegetableThumb } from "./vegetable-thumb";
import { getVegetable } from "../_lib/vegetables";
import { useBasket, removeFromBasket, setBasketWeight, addToBasket } from "../_lib/basket-store";
import { useFavorites } from "../_lib/favorites-store";
import { useReports } from "../_lib/reports-store";
import { useCurrentDistrict } from "../_lib/location";
import { formatNumber, formatWon } from "../_lib/format";
import { AddVegetableSheet } from "./add-vegetable-sheet";
import { CourseCard } from "./course-card";
import { RepeatShopping } from "./repeat-shopping";
import { ShareErrandButton } from "./share-errand-button";
import { QuantityStepper } from "./quantity-stepper";
import { planCourse } from "../_lib/course";
import type { PriceMap } from "../_lib/stores";

// F07 장바구니 — "장보기 전 예산 계획". 담은 품목의 KAMIS 기준 예상액 vs 동네 최저 제보가 기준 예상액을 비교한다.
// 실 구매 액션은 아님(계획 도구) — 각 행의 "제보하러 가기"가 F03-1 제보 플로우로 연결한다.
export function BasketContent({ priceMap }: { priceMap: PriceMap }) {
  const items = useBasket();
  const favorites = useFavorites();
  const { district } = useCurrentDistrict();
  const districtReports = useReports({ district });

  if (items.length === 0) {
    const favoriteVegs = favorites.map((id) => getVegetable(id)).filter((v) => v !== undefined);
    return (
      <div className="flex flex-col gap-8 px-4 pt-16">
        <div className="flex flex-col items-center gap-2 text-center">
          <p className="text-body-16-semibold text-fg-neutral">아직 담은 야채가 없어요</p>
          <p className="text-body-14-regular text-fg-neutral-muted">
            장 보기 전에 살 야채를 담아 예상 금액을 미리 확인해요
          </p>
        </div>

        {favoriteVegs.length > 0 && (
          <div className="flex flex-col gap-3">
            <h2 className="text-body-14-medium text-fg-neutral-muted">찜한 야채로 빠르게 담기</h2>
            <ul className="grid grid-cols-3 gap-3">
              {favoriteVegs.map((veg) => (
                <li key={veg.id}>
                  <button
                    type="button"
                    onClick={() => addToBasket(veg.id, 1)}
                    className="flex w-full flex-col items-center gap-1.5 rounded-2xl bg-bg-neutral-weak py-4 active:bg-bg-neutral-weak-pressed"
                  >
                    <VegetableThumb image={veg.image} emoji={veg.emoji} size="lg" />
                    <span className="text-body-14-medium text-fg-neutral">{veg.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <RepeatShopping />

        <AddVegetableSheet />
      </div>
    );
  }

  // 행을 만들면서 합계를 누적하지 않는다 — 렌더 중 외부 변수를 재대입하면
  // 리렌더마다 값이 누적돼 어긋난다(react-hooks/immutability). 행에 소계를 담아두고 합계는 따로 접는다.
  const rows = items.map((item) => {
    const veg = getVegetable(item.vegetableId);
    if (!veg) return null;

    const kamisPerKg = priceMap[item.vegetableId] ?? 0;
    const reportPrices = districtReports
      .filter((r) => r.vegetableId === item.vegetableId)
      .map((r) => r.pricePerKg);
    const lowestPerKg = reportPrices.length > 0 ? Math.min(...reportPrices) : kamisPerKg;

    return {
      veg,
      item,
      kamisSubtotal: kamisPerKg * item.weightKg,
      lowestSubtotal: lowestPerKg * item.weightKg,
      hasReport: reportPrices.length > 0,
    };
  });

  const totalKamis = rows.reduce((sum, row) => sum + (row?.kamisSubtotal ?? 0), 0);
  const totalLowest = rows.reduce((sum, row) => sum + (row?.lowestSubtotal ?? 0), 0);
  const saved = totalKamis - totalLowest;

  return (
    <div className="flex flex-col gap-6 px-4 pt-3 pb-10">
      <p aria-live="polite" className="sr-only">
        장바구니에 {items.length}개 담았어요
      </p>
      {/* 예상 총액 — "이론상 최저"와 "실제로 가능한 금액"을 구분해 보여준다.
          동네 최저가를 전부 모으면 가게가 흩어져 한 번에 살 수 없다 → 실현 가능한 안은 아래 코스가 담당. */}
      <section aria-label="예상 총액" className="flex flex-col gap-3 rounded-2xl bg-bg-neutral-weak px-5 py-5">
        <div className="flex items-center justify-between text-body-14-regular">
          <span className="text-fg-neutral-muted">공공 시세 기준</span>
          <span className="tabular-nums text-fg-neutral">{formatWon(totalKamis)}</span>
        </div>
        <div className="flex items-center justify-between text-body-14-regular">
          <span className="text-fg-neutral-muted">동네 최저가를 전부 모으면</span>
          <span className="tabular-nums text-fg-neutral">{formatWon(totalLowest)}</span>
        </div>
        {saved > 0 && (
          <div className="flex flex-col gap-1 border-t border-bg-neutral-weak-pressed pt-3">
            <div className="flex items-center justify-between">
              <span className="text-body-14-medium text-fg-neutral">최대 절약 가능액</span>
              <span className="text-body-16-semibold tabular-nums text-fg-positive">
                {formatNumber(saved)}원
              </span>
            </div>
            <p className="text-caption-12-regular text-fg-neutral-muted">
              가게가 흩어져 있을 수 있어요. 실제로 갈 만한 코스는 아래에서 확인하세요.
            </p>
          </div>
        )}
      </section>

      {/* 장보기 코스 — 한 곳에서 다 사기 vs 두 곳 돌기 */}
      <CourseCard plan={planCourse(items, districtReports, priceMap)} district={district} />

      {/* 계획(장바구니) → 실행. 내가 갈지, 가족에게 부탁할지 두 갈래를 나란히 둔다 */}
      <div className="flex flex-col gap-2">
        <ActionButton asChild variant="brandSolid" size="large" className="w-full">
          <Link href="/prototype/shopping">장보기 시작하기</Link>
        </ActionButton>
        <ShareErrandButton items={items} />
      </div>

      <ul className="flex flex-col gap-2">
        {rows.map((row) => {
          if (!row) return null;
          const { veg, item, kamisSubtotal, hasReport } = row;
          return (
            <li key={veg.id} className="flex flex-col gap-3 rounded-2xl bg-bg-neutral-weak px-4 py-3">
              <div className="flex items-center gap-3">
                <VegetableThumb image={veg.image} emoji={veg.emoji} size="md" />
                <span className="min-w-0 flex-1">
                  <span className="block text-body-16-semibold text-fg-neutral">{veg.name}</span>
                  <span className="block text-caption-12-regular text-fg-neutral-muted">
                    {formatWon(kamisSubtotal)}
                    {!hasReport && " · 동네 제보 없음(시세로 대체)"}
                  </span>
                </span>
                {/* 수량 조절 — 단위는 품목마다 다르다. 삭제는 이 스테퍼가 아니라 아래 한 곳만 담당한다
                    (이전엔 1kg에서 −를 눌러도 삭제돼 삭제 경로가 둘로 갈렸다) */}
                <QuantityStepper
                  quantity={item.weightKg}
                  unitType={veg.unitType}
                  onChange={(next) => setBasketWeight(veg.id, next)}
                  itemName={veg.name}
                />
                <button
                  type="button"
                  aria-label={`${veg.name} 장바구니에서 빼기`}
                  onClick={() => removeFromBasket(veg.id)}
                  className="flex size-11 shrink-0 items-center justify-center text-body-16-regular text-fg-neutral-muted"
                >
                  <span aria-hidden="true">×</span>
                </button>
              </div>
              <Link
                href={`/prototype/price/${veg.id}`}
                className="text-caption-12-regular text-fg-neutral-muted underline"
              >
                제보하러 가기 →
              </Link>
            </li>
          );
        })}
      </ul>

      <AddVegetableSheet excludeIds={items.map((i) => i.vegetableId)} />
    </div>
  );
}
