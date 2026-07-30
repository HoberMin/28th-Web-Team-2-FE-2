"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TextField, TextFieldInput } from "seed-design/ui/text-field";
import { ActionButton } from "seed-design/ui/action-button";
import { RadioChipItem, RadioChipRoot, ChipLabel } from "seed-design/ui/chip";
import { AppBar, BottomBar, PhoneFrame, Scroll } from "../_lib/shell";
import type { HomeVegetableItem } from "../_lib/home-data";
import { getMarketUnitOptions, getVegetable, POPULAR_IDS } from "../_lib/vegetables";
import { useFavorites } from "../_lib/favorites-store";
import { useReports } from "../_lib/reports-store";
import { useCurrentDistrict } from "../_lib/location";
import { judgePrice } from "../_lib/judgement";
import { formatNumber } from "../_lib/format";
import { matchesVegetableName } from "../_lib/search";
import { VerdictCard } from "./verdict-card";
import { VegetableThumb } from "./vegetable-thumb";

// F10 즉석 판단 — 매장 가격표 앞에서 "이 가격 사도 되나"를 3초에 끝낸다.
// 판정 기준: 우리 동네 최저 제보가(있으면) → 없으면 오늘 공공 시세.
// 판정이 끝나면 바로 제보로 이어진다 — 판단을 위해 이미 가격을 입력했으니 제보 비용이 0이다.
export function QuickJudge({
  items,
  initialItemId,
}: {
  items: HomeVegetableItem[];
  initialItemId: string;
}) {
  const router = useRouter();
  const favorites = useFavorites();
  const { district } = useCurrentDistrict();
  const [itemId, setItemId] = useState(initialItemId);
  const [unitLabel, setUnitLabel] = useState("");
  const [priceText, setPriceText] = useState("");
  const [query, setQuery] = useState("");

  const veg = getVegetable(itemId);
  const selected = items.find((i) => i.id === itemId);
  const unitOptions = veg ? getMarketUnitOptions(veg) : [];
  const unit = unitOptions.find((o) => o.label === unitLabel) ?? unitOptions[0];

  const reports = useReports({ vegetableId: itemId, district });

  // 자주 쓰는 품목을 앞에 — 찜한 야채 → 인기 8종 순. 검색어가 있으면 전체에서 찾는다.
  const candidates = useMemo(() => {
    const keyword = query.trim();
    if (keyword) return items.filter((i) => matchesVegetableName(i.name, keyword)).slice(0, 12);
    const ordered = [...favorites, ...POPULAR_IDS];
    const seen = new Set<string>();
    const picked: HomeVegetableItem[] = [];
    for (const id of ordered) {
      if (seen.has(id)) continue;
      seen.add(id);
      const found = items.find((i) => i.id === id);
      if (found) picked.push(found);
      if (picked.length >= 10) break;
    }
    return picked;
  }, [favorites, items, query]);

  const priceNum = Number(priceText.replace(/[^0-9]/g, ""));
  // 입력값은 사용자가 고른 시장 단위 기준 → 기준 단위(1kg·1개 등)로 환산해서 비교한다.
  const pricePerUnit = unit && unit.ratio > 0 ? Math.round(priceNum / unit.ratio) : priceNum;

  const judgement =
    selected?.price != null && priceNum > 0
      ? judgePrice({ pricePerUnit, baselinePrice: selected.price, neighborReports: reports })
      : null;

  function handleSelectItem(id: string) {
    setItemId(id);
    setUnitLabel("");
    setQuery("");
  }

  const reportHref = veg
    ? `/prototype/report/location?item=${veg.id}&method=manual&price=${priceNum}&weight=${unit?.ratio ?? 1}`
    : "#";

  return (
    <PhoneFrame>
      <AppBar title="이 가격 사도 될까요?" onBack={() => router.back()} />
      <Scroll className="px-4 pb-6">
        <div className="flex flex-col gap-7 pt-2">
          {/* 1단계 — 품목 */}
          <section aria-label="야채 고르기" className="flex flex-col gap-3">
            <h2 className="text-body-16-semibold text-fg-neutral">어떤 야채예요?</h2>
            <TextField label="야채 검색" value={query} onValueChange={(v) => setQuery(v.value)}>
              <TextFieldInput placeholder="이름 또는 초성 (예: ㄱㅈ)" />
            </TextField>
            <RadioChipRoot
              value={itemId}
              onValueChange={(v) => handleSelectItem(v)}
              aria-label="야채 선택"
              className="flex flex-wrap gap-2"
            >
              {candidates.map((c) => (
                <RadioChipItem key={c.id} value={c.id}>
                  <ChipLabel>{c.name}</ChipLabel>
                </RadioChipItem>
              ))}
            </RadioChipRoot>
            {candidates.length === 0 && (
              <p className="text-body-14-regular text-fg-neutral-muted">
                &lsquo;{query.trim()}&rsquo; 이름의 야채가 없어요
              </p>
            )}
          </section>

          {/* 2단계 — 단위 + 가격 */}
          {veg && (
            <section aria-label="가격 입력" className="flex flex-col gap-3">
              <h2 className="text-body-16-semibold text-fg-neutral">얼마에 파나요?</h2>
              <div className="flex items-center gap-2 rounded-2xl bg-bg-neutral-weak px-4 py-3">
                <VegetableThumb image={veg.image} emoji={veg.emoji} size="sm" />
                <span className="text-body-14-medium text-fg-neutral">{veg.name}</span>
                {selected?.price != null && (
                  <span className="ml-auto text-caption-12-regular tabular-nums text-fg-neutral-muted">
                    오늘 시세 {formatNumber(selected.price)}원/{veg.unit}
                  </span>
                )}
              </div>

              {/* 시장은 kg으로 안 팔기도 한다 — 단위를 먼저 고르게 하고 환산은 앱이 한다 */}
              <RadioChipRoot
                value={unit?.label ?? ""}
                onValueChange={(v) => setUnitLabel(v)}
                aria-label="파는 단위"
                className="flex flex-wrap gap-2"
              >
                {unitOptions.map((o) => (
                  <RadioChipItem key={o.label} value={o.label}>
                    <ChipLabel>{o.label}</ChipLabel>
                  </RadioChipItem>
                ))}
              </RadioChipRoot>

              <TextField
                label={`${unit?.label ?? veg.unit} 가격`}
                value={priceText}
                onValueChange={(v) => setPriceText(v.value)}
                suffix="원"
                description={
                  unit && unit.ratio !== 1 && priceNum > 0
                    ? `${veg.unit} ${formatNumber(pricePerUnit)}원으로 계산했어요${unit.note ? ` · ${unit.note}` : ""}`
                    : undefined
                }
              >
                <TextFieldInput inputMode="numeric" placeholder="예: 3000" />
              </TextField>
            </section>
          )}

          {/* 3단계 — 판정 */}
          {judgement && (
            <VerdictCard
              judgement={judgement}
              unit={veg?.unit ?? ""}
              pricePerUnit={pricePerUnit}
              reportCount={reports.length}
              district={district}
            />
          )}

          {veg && selected?.price == null && (
            <p className="rounded-xl bg-bg-neutral-weak px-4 py-6 text-center text-body-14-regular text-fg-neutral-muted">
              {veg.name}은 지금 시세 데이터가 없어요{veg.season ? ` (${veg.season.label})` : ""}.
              <br />
              가격을 제보해두면 이웃에게 도움이 돼요.
            </p>
          )}
        </div>
      </Scroll>

      {/* 판단이 끝나면 제보로 — 가격을 이미 입력했으니 추가 입력이 거의 없다.
          하단바는 **항상** 렌더한다: 조건부로 나타나면 판정 순간 화면이 위로 튄다(입력 중 레이아웃 점프). */}
      <BottomBar>
        {judgement ? (
          <ActionButton asChild variant="brandSolid" size="large" className="w-full">
            <Link href={reportHref}>이 가격 제보하기</Link>
          </ActionButton>
        ) : (
          <ActionButton type="button" variant="brandSolid" size="large" className="w-full" disabled>
            가격을 입력하면 알려드려요
          </ActionButton>
        )}
      </BottomBar>
    </PhoneFrame>
  );
}
