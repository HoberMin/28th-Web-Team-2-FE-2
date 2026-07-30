"use client";

import { useState } from "react";
import Link from "next/link";
import { ActionButton } from "seed-design/ui/action-button";
import { Checkbox } from "seed-design/ui/checkbox";
import { AppBar, BottomBar, PhoneFrame, Scroll } from "../_lib/shell";
import { decodeErrandList, getPriceCeiling } from "../_lib/errand";
import { getVegetable } from "../_lib/vegetables";
import { useReports } from "../_lib/reports-store";
import { useCurrentDistrict } from "../_lib/location";
import { getNeighborhoodLowest } from "../_lib/judgement";
import { formatNumber, formatQuantity } from "../_lib/format";
import type { PriceMap } from "../_lib/stores";
import { VegetableThumb } from "./vegetable-thumb";

// F12 심부름 목록 — 부탁받은 사람 전용 화면. 화면에 두 가지만 둔다:
//   ① 뭘 얼마나 사야 하는지  ② 이 가격까지는 사도 되는지(상한)
// 시세 그래프·제보 목록 같은 건 넣지 않는다. 이 사람은 판단을 배우러 온 게 아니라 심부름 중이다.
export function ErrandList({ raw, priceMap }: { raw: string; priceMap: PriceMap }) {
  const items = decodeErrandList(raw);
  const { district } = useCurrentDistrict();
  const reports = useReports({ district });
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  if (items.length === 0) {
    return (
      <PhoneFrame>
        <AppBar title="심부름 목록" backHref="/prototype" />
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
          <p className="text-body-16-semibold text-fg-neutral">목록이 비어 있어요</p>
          <p className="text-body-14-regular text-fg-neutral-muted">
            링크가 잘렸을 수 있어요. 보내주신 분께 다시 받아주세요.
          </p>
        </div>
      </PhoneFrame>
    );
  }

  const doneCount = items.filter((i) => checked[i.vegetableId]).length;

  return (
    <PhoneFrame>
      <AppBar title="심부름 목록" backHref="/prototype" />
      <Scroll className="px-4 pb-6">
        <div className="flex flex-col gap-4 pt-2">
          <div className="flex flex-col gap-1 rounded-2xl bg-bg-brand-weak px-5 py-4">
            <p className="text-body-16-semibold text-fg-neutral">
              {items.length}개 사다 주세요
            </p>
            <p className="text-body-14-regular text-fg-neutral-muted">
              각 야채마다 &lsquo;이 가격까지&rsquo;가 적혀 있어요. 그보다 비싸면 안 사도 괜찮아요.
            </p>
            {/* 상한의 근거를 밝힌다 — 받은 사람의 위치가 보낸 사람과 다를 수 있다 */}
            <p className="text-caption-12-regular text-fg-neutral-muted">
              {district} 시세·이웃 제보가 기준
            </p>
          </div>

          <ul className="flex flex-col gap-2">
            {items.map((item) => {
              const veg = getVegetable(item.vegetableId);
              if (!veg) return null;
              const lowest = getNeighborhoodLowest(
                reports.filter((r) => r.vegetableId === item.vegetableId),
              );
              const ceiling = getPriceCeiling(priceMap[item.vegetableId] ?? null, lowest);
              // 상한은 담을 수량 전체 기준으로 환산해서 준다 — 매장에서 단가를 곱하게 만들면 안 된다.
              const totalCeiling = ceiling != null ? ceiling * item.weightKg : null;
              const isDone = !!checked[item.vegetableId];

              return (
                <li key={item.vegetableId}>
                  {/* seed Checkbox — 라벨 전체가 터치 타겟이다(매장에서 한 손으로 누른다).
                      raw input을 쓰면 체크 표시가 OS마다 다르고 포커스 링도 제각각이다 */}
                  <Checkbox
                    checked={isDone}
                    onCheckedChange={(next) =>
                      setChecked((prev) => ({ ...prev, [item.vegetableId]: next === true }))
                    }
                    className={`w-full gap-3 rounded-2xl px-4 py-3 ${
                      isDone ? "bg-bg-positive-weak" : "bg-bg-neutral-weak"
                    }`}
                    label={
                      <span className="flex min-w-0 flex-1 items-center gap-3">
                        <VegetableThumb image={veg.image} emoji={veg.emoji} size="md" />
                        <span className="flex min-w-0 flex-1 flex-col">
                          <span
                            className={`text-body-16-semibold ${
                              isDone ? "text-fg-neutral-muted line-through" : "text-fg-neutral"
                            }`}
                          >
                            {veg.name} {formatQuantity(item.weightKg, veg.unitType)}
                          </span>
                          {totalCeiling != null ? (
                            <span className="text-caption-12-regular tabular-nums text-fg-neutral-muted">
                              {formatNumber(totalCeiling)}원까지면 사도 돼요
                            </span>
                          ) : (
                            <span className="text-caption-12-regular text-fg-neutral-muted">
                              기준 가격이 없어요 — 보내주신 분께 물어보세요
                            </span>
                          )}
                        </span>
                      </span>
                    }
                  />
                </li>
              );
            })}
          </ul>

          <p aria-live="polite" className="text-center text-caption-12-regular tabular-nums text-fg-neutral-muted">
            {doneCount} / {items.length}개 담았어요
          </p>
        </div>
      </Scroll>

      <BottomBar>
        {/* 심부름하는 사람도 이 앱을 쓰게 되는 자연스러운 지점 */}
        <ActionButton asChild variant="neutralWeak" size="large" className="w-full">
          <Link href="/prototype/judge">가격이 애매하면 여기서 확인하기</Link>
        </ActionButton>
      </BottomBar>
    </PhoneFrame>
  );
}
