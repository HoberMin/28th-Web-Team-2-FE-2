"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ActionButton } from "seed-design/ui/action-button";
import { TextField, TextFieldInput } from "seed-design/ui/text-field";
import { AppBar, BottomBar, PhoneFrame, Scroll } from "../_lib/shell";
import { clearBasket, useBasket } from "../_lib/basket-store";
import { getVegetable } from "../_lib/vegetables";
import { useReports, addReport } from "../_lib/reports-store";
import { useCurrentDistrict } from "../_lib/location";
import { judgePrice } from "../_lib/judgement";
import { formatQuantity, formatNumber, formatWon } from "../_lib/format";
import type { PriceMap } from "../_lib/stores";
import { VegetableThumb } from "./vegetable-thumb";
import { VerdictCard } from "./verdict-card";

/** 한 품목의 매장 결과 — 샀는지, 얼마에 샀는지. */
interface ItemResult {
  priceText: string;
  bought: boolean | null;
}

// F11 장보는 중(매장 모드).
//
// 왜 필요한가: 장바구니를 들고 매장에 서 있는 사람은 5품목을 하나씩 확인해야 한다. 기존 경로는
// 품목마다 [뒤로 → 다음 품목 → 가격 확인]을 반복해야 했고, 다 사고 나서 제보를 또 따로 해야 했다.
// 여기서는 담은 목록을 순회하며 가격을 넣으면 즉시 판정이 나오고, 마지막에 **산 것만 한 번에 제보**한다.
// → 제보 비용이 거의 0이 된다(핵심 가치: 시간·노력 절약, 그리고 제보 유인 문제의 실질적 해법).
export function ShoppingMode({ priceMap }: { priceMap: PriceMap }) {
  const router = useRouter();
  const items = useBasket();
  const { district } = useCurrentDistrict();
  const districtReports = useReports({ district });
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<Record<string, ItemResult>>({});
  const [place, setPlace] = useState("");
  const [done, setDone] = useState(false);

  const current = items[index];
  const veg = current ? getVegetable(current.vegetableId) : undefined;
  const result = current ? results[current.vegetableId] : undefined;

  const priceNum = Number((result?.priceText ?? "").replace(/[^0-9]/g, ""));
  // 입력은 "담은 수량 전체 가격" → 단가로 환산해 시세와 비교한다.
  const pricePerUnit = current && current.weightKg > 0 ? Math.round(priceNum / current.weightKg) : priceNum;
  const baselinePrice = current ? (priceMap[current.vegetableId] ?? null) : null;

  const neighborReports = useMemo(
    () => districtReports.filter((r) => r.vegetableId === current?.vegetableId),
    [districtReports, current?.vegetableId],
  );

  const judgement =
    baselinePrice != null && priceNum > 0
      ? judgePrice({ pricePerUnit, baselinePrice, neighborReports })
      : null;

  function update(patch: Partial<ItemResult>) {
    if (!current) return;
    setResults((prev) => {
      const base: ItemResult = prev[current.vegetableId] ?? { priceText: "", bought: null };
      return { ...prev, [current.vegetableId]: { ...base, ...patch } };
    });
  }

  /** 산 것만 제보로 등록하고 장바구니를 비운다. 안 산 것도 목격가라 함께 제보한다(purchased=false). */
  function finish() {
    for (const item of items) {
      const r = results[item.vegetableId];
      if (!r || r.bought === null) continue;
      const price = Number(r.priceText.replace(/[^0-9]/g, ""));
      if (price <= 0) continue;
      addReport({
        vegetableId: item.vegetableId,
        district,
        place: place.trim() || undefined,
        weightKg: item.weightKg,
        price,
        method: "manual",
        purchased: r.bought,
      });
    }
    clearBasket();
    setDone(true);
  }

  // ── 장바구니가 비어 있으면 시작할 수 없다 ──────────────────────
  if (items.length === 0 && !done) {
    return (
      <PhoneFrame>
        <AppBar title="장보는 중" onBack={() => router.back()} />
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
          <p className="text-body-16-semibold text-fg-neutral">담은 야채가 없어요</p>
          <p className="text-body-14-regular text-fg-neutral-subtle">
            장바구니에 살 야채를 먼저 담으면, 매장에서 하나씩 확인하며 담을 수 있어요.
          </p>
          <ActionButton asChild variant="neutralSolid" size="medium">
            <Link href="/prototype/basket">장바구니로 가기</Link>
          </ActionButton>
        </div>
      </PhoneFrame>
    );
  }

  // ── 완료 화면 ─────────────────────────────────────────────────
  if (done) {
    const bought = Object.values(results).filter((r) => r.bought === true);
    const spent = items.reduce((sum, item) => {
      const r = results[item.vegetableId];
      if (!r || r.bought !== true) return sum;
      return sum + Number(r.priceText.replace(/[^0-9]/g, ""));
    }, 0);

    return (
      <PhoneFrame>
        <AppBar title="장보기 완료" />
        <div className="flex flex-1 flex-col items-center justify-center gap-6 px-8 text-center">
          <div className="flex flex-col gap-2">
            <p className="text-head2-20 text-fg-neutral">
              {bought.length}개 담고 {formatWon(spent)} 썼어요
            </p>
            <p className="text-body-14-regular text-fg-neutral-subtle">
              입력한 가격은 이웃 제보로 등록했어요. {district} 이웃이 헛걸음하지 않게 도왔어요.
            </p>
          </div>
          <div className="flex w-full flex-col gap-2">
            <ActionButton asChild variant="brandSolid" size="large" className="w-full">
              <Link href="/prototype/mypage">내 절약 금액 보기</Link>
            </ActionButton>
            <ActionButton asChild variant="neutralWeak" size="large" className="w-full">
              <Link href="/prototype">홈으로</Link>
            </ActionButton>
          </div>
        </div>
      </PhoneFrame>
    );
  }

  const isLast = index === items.length - 1;
  const answered = result?.bought !== null && result?.bought !== undefined && priceNum > 0;

  return (
    <PhoneFrame>
      {/* 뒤로가기는 **이전 품목으로** 간다(마법사 패턴).
          화면을 나가버리면 매장에서 지금까지 입력한 가격이 전부 사라진다 — 실수로 한 번 누른 값이
          크다. 첫 품목에서만 화면을 벗어난다. */}
      <AppBar
        title={`${index + 1} / ${items.length}`}
        onBack={() => (index > 0 ? setIndex((i) => i - 1) : router.back())}
      />

      {/* 진행률 — 몇 개 남았는지가 매장에서 가장 궁금하다.
          시각 바는 aria-hidden이고, 진행 상황은 아래 텍스트가 스크린리더에 전달한다 */}
      <div className="flex flex-col gap-1 px-4 pb-2">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-bg-neutral-weak" aria-hidden="true">
          <div
            className="h-full rounded-full bg-bg-brand-solid transition-all"
            style={{ width: `${((index + (answered ? 1 : 0)) / items.length) * 100}%` }}
          />
        </div>
        <p aria-live="polite" className="sr-only">
          {items.length}개 중 {index + 1}번째 야채예요
        </p>
      </div>

      <Scroll className="px-4 pb-6">
        {current && veg && (
          <div className="flex flex-col gap-5 pt-2">
            <div className="flex items-center gap-3 rounded-2xl bg-bg-neutral-weak px-4 py-4">
              <VegetableThumb image={veg.image} emoji={veg.emoji} size="lg" />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="text-head2-18 text-fg-neutral">{veg.name}</span>
                <span className="text-body-14-regular text-fg-neutral-subtle">
                  {formatQuantity(current.weightKg, veg.unitType)} 담을 예정
                </span>
              </span>
              {baselinePrice != null && (
                <span className="shrink-0 text-right text-caption-12-regular tabular-nums text-fg-neutral-subtle">
                  오늘 시세
                  <br />
                  {formatNumber(baselinePrice)}원/{veg.unit}
                </span>
              )}
            </div>

            <TextField
              label={`${formatQuantity(current.weightKg, veg.unitType)} 가격`}
              value={result?.priceText ?? ""}
              onValueChange={(v) => update({ priceText: v.value })}
              suffix="원"
              description={
                current.weightKg !== 1 && priceNum > 0
                  ? `${veg.unit} ${formatNumber(pricePerUnit)}원으로 계산했어요`
                  : "가격표에 적힌 금액을 그대로 넣어도 돼요"
              }
            >
              <TextFieldInput inputMode="numeric" placeholder="예: 3000" autoFocus />
            </TextField>

            {judgement && (
              <VerdictCard
                judgement={judgement}
                unit={veg.unit}
                pricePerUnit={pricePerUnit}
                reportCount={neighborReports.length}
                district={district}
              />
            )}

            {baselinePrice == null && (
              <p className="rounded-xl bg-bg-neutral-weak px-4 py-6 text-center text-body-14-regular text-fg-neutral-subtle">
                {veg.name}은 지금 시세 데이터가 없어 판정은 못 하지만, 가격을 남기면 이웃에게 도움이 돼요.
              </p>
            )}

            {/* 샀는지 여부 — 판정을 보고 결정한다. 안 샀어도 목격가는 제보에 기여한다 */}
            {priceNum > 0 && (
              <div className="flex gap-2">
                <ActionButton
                  type="button"
                  variant={result?.bought === true ? "brandSolid" : "neutralWeak"}
                  size="large"
                  className="flex-1"
                  onClick={() => update({ bought: true })}
                >
                  담았어요
                </ActionButton>
                <ActionButton
                  type="button"
                  variant={result?.bought === false ? "neutralSolid" : "neutralWeak"}
                  size="large"
                  className="flex-1"
                  onClick={() => update({ bought: false })}
                >
                  안 살래요
                </ActionButton>
              </div>
            )}

            {/* 마지막 품목에서만 가게를 묻는다 — 품목마다 물으면 5번 반복이다 */}
            {isLast && (
              <TextField
                label="어느 가게였어요?"
                value={place}
                onValueChange={(v) => setPlace(v.value)}
                description={`이번에 담은 ${items.length}개 전부에 같은 가게로 기록해요. 비워두면 ${district}까지만 남아요`}
              >
                <TextFieldInput placeholder="예: 선릉시장 3번 가게" />
              </TextField>
            )}
          </div>
        )}
      </Scroll>

      <BottomBar>
        {isLast ? (
          <ActionButton
            type="button"
            variant="brandSolid"
            size="large"
            className="w-full"
            disabled={!answered}
            onClick={finish}
          >
            장보기 끝내고 제보하기
          </ActionButton>
        ) : (
          <ActionButton
            type="button"
            variant="brandSolid"
            size="large"
            className="w-full"
            disabled={!answered}
            onClick={() => setIndex((i) => i + 1)}
          >
            다음 야채
          </ActionButton>
        )}
      </BottomBar>
    </PhoneFrame>
  );
}
