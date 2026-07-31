"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TextField, TextFieldInput } from "seed-design/ui/text-field";
import { ActionButton } from "seed-design/ui/action-button";
import { RadioChipItem, RadioChipRoot, ChipLabel } from "seed-design/ui/chip";
import { AppBar, BottomBar, PhoneFrame, Scroll } from "../_lib/shell";
import type { HomeVegetableItem } from "../_lib/home-data";
import { getMarketUnitOptions, getVegetable } from "../_lib/vegetables";
import { useReports } from "../_lib/reports-store";
import { useCurrentDistrict } from "../_lib/location";
import { isOutlier, getReportAge } from "../_lib/stores";
import { judgePrice } from "../_lib/judgement";
import { formatNumber } from "../_lib/format";
import type { Vegetable } from "../_lib/types";
import { VerdictCard, verdictAnnouncement, type JudgeStatus } from "./verdict-card";
import { VegetablePickerSheet } from "./vegetable-picker-sheet";
import { VegetableThumb } from "./vegetable-thumb";

// F10 즉석 판단 — 매장 가격표 앞에서 "이 가격 사도 되나"를 3초에 끝낸다.
// 판정 기준: 오늘 공공 시세 단일(가게 상세·매장과 동일 기준 — judgement.ts 참조).
// 동네 이웃 제보는 판정엔 안 쓰고 참고 건수로만 화면에 보여준다(이상치·오래된 제보는 그 건수에서도 뺀다).
// 판정이 끝나면 바로 제보로 이어진다 — 판단을 위해 이미 가격을 입력했으니 제보 비용이 0이다.
export function QuickJudge({
  items,
  initialItemId,
  todayIso,
}: {
  items: HomeVegetableItem[];
  initialItemId: string;
  /** 이상치·오래된 제보 제외 판정에 쓰는 "오늘" — 서버·클라 기준을 맞춘다. */
  todayIso: string;
}) {
  const router = useRouter();
  const { district } = useCurrentDistrict();
  const [itemId, setItemId] = useState(initialItemId);
  const [unitLabel, setUnitLabel] = useState("");
  const [priceText, setPriceText] = useState("");

  const veg = getVegetable(itemId);
  const selected = items.find((i) => i.id === itemId);
  const unitOptions = veg ? getMarketUnitOptions(veg) : [];
  // 단위를 실제로 고르기 전엔 아무 옵션도 "고른 것"으로 표시하지 않는다 — 예전엔 첫 옵션으로
  // 조용히 폴백해서 1망(1.5kg) 가격이 1kg으로 판정될 수 있었다(백로그 F10 #8).
  const unit = unitOptions.find((o) => o.label === unitLabel);

  const reports = useReports({ vegetableId: itemId, district });
  // 참고용 제보 건수도 판정과 같은 잣대로 거른다 — 장난 제보·60일 전 제보가 "참고할 동네 제보 N건"에
  // 그대로 섞이면 판정엔 안 쓰여도 화면이 과장된다(백로그 F10 #2).
  const referenceReportCount = reports.filter(
    (r) =>
      !isOutlier(r.pricePerKg, selected?.price ?? null) &&
      getReportAge(r.createdAt, todayIso).level !== "stale",
  ).length;

  const priceNum = Number(priceText.replace(/[^0-9]/g, ""));
  const priceIsInvalid = priceText.trim().length > 0 && priceNum <= 0;
  // 입력값은 사용자가 고른 시장 단위 기준 → 기준 단위(1kg·1개 등)로 환산해서 비교한다.
  const pricePerUnit = unit && unit.ratio > 0 ? Math.round(priceNum / unit.ratio) : 0;

  const judgement =
    veg && unit && priceNum > 0 && selected?.price != null
      ? judgePrice({ pricePerUnit, baselinePrice: selected.price })
      : null;

  const status: JudgeStatus = !veg
    ? { kind: "empty" }
    : !unit
      ? { kind: "needUnit" }
      : priceNum <= 0
        ? { kind: "needPrice" }
        : selected?.price == null
          ? { kind: "noBaseline", vegetableName: veg.name, seasonLabel: veg.season?.label }
          : judgement
            ? {
                kind: "result",
                judgement,
                unit: veg.unit,
                pricePerUnit,
                reportCount: referenceReportCount,
                district,
              }
            : { kind: "needPrice" };

  function handleSelectItem(next: Vegetable) {
    setItemId(next.id);
    setUnitLabel("");
  }

  // 가게 위치는 제보 폼 안의 drawer에서 고른다 → 위치 선택 화면을 거치지 않고 폼으로 직행.
  // 시세 데이터가 없는 품목이어도(선택.price == null) 가격을 입력했으면 제보로 보낼 수 있다 —
  // "제보해두면 도움이 돼요"라고 권하면서 그 버튼을 막아두는 건 막다른 길이다(백로그 F10 #7).
  // 단위를 안 고른 채로 보내면 1kg으로 조용히 폴백돼, 1망(1.5kg) 가격이 1kg 제보로 남는다.
  // 판정에서 없앤 바로 그 폴백이라 제보 경로에도 같은 잣대를 적용한다(백로그 F10 #8).
  const reportHref =
    veg && unit
      ? `/prototype/report?item=${veg.id}&method=manual&price=${priceNum}&weight=${unit.ratio}`
      : "#";
  const canReport = Boolean(veg) && Boolean(unit) && priceNum > 0;

  return (
    <PhoneFrame>
      <AppBar title="이 가격 사도 될까요?" onBack={() => router.back()} />

      {/* 판단 카드 — 입력칸 위, AppBar 바로 아래에 항상 떠 있는 영역(스크롤 밖).
          예전엔 스크롤 본문 하단에 조건부로 떠서 키보드가 열리면 화면 밖으로 밀렸다
          (백로그 F10 #1). Scroll 영역 밖의 고정 자리라 키보드가 열려도 항상 보인다. */}
      {/* 상시 라이브 리전 — 판정 카드 안의 h2는 상태마다 파괴·재생성돼 갱신으로 안 잡힌다.
          이 요소는 항상 같은 자리에 남아 텍스트만 바뀌므로 첫 판정도 낭독된다.
          headline 한 줄만 넣어 한 글자 입력마다 카드 전체가 재낭독되는 것도 막는다. */}
      <p className="sr-only" role="status" aria-live="polite">
        {verdictAnnouncement(status)}
      </p>

      <div className="shrink-0 border-b border-bg-neutral-weak-pressed px-4 py-3">
        <VerdictCard status={status} />
      </div>

      <Scroll className="px-4 pb-6">
        <div className="flex flex-col gap-7 pt-4">
          {/* 1단계 — 품목: 제보 폼과 같은 시트로 통일(백로그 F10 #10) — 검색으로 좁혀 골라도
              칩이 사라지는 일이 없다(#3). 트리거 자체가 선택 상태를 보여주는 칩이라 항상 남는다. */}
          <section aria-label="야채 고르기" className="flex flex-col gap-3">
            <h2 className="text-body-16-semibold text-fg-neutral">어떤 야채예요?</h2>
            <VegetablePickerSheet value={veg} onSelect={handleSelectItem} />
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

              {/* 시장은 kg으로 안 팔기도 한다 — 단위를 먼저 고르게 하고 환산은 앱이 한다.
                  최소 44×44px 터치 영역(백로그 F10 #4). */}
              <RadioChipRoot
                value={unit?.label ?? ""}
                onValueChange={(v) => setUnitLabel(v)}
                aria-label="파는 단위"
                className="flex flex-wrap gap-2"
              >
                {unitOptions.map((o) => (
                  <RadioChipItem key={o.label} value={o.label} className="min-h-11">
                    <ChipLabel>{o.label}</ChipLabel>
                  </RadioChipItem>
                ))}
              </RadioChipRoot>

              <TextField
                label={`${unit?.label ?? veg.unit} 가격`}
                value={priceText}
                onValueChange={(v) => setPriceText(v.value)}
                suffix="원"
                invalid={priceIsInvalid}
                errorMessage="숫자로 된 가격을 입력해주세요"
                description={
                  !priceIsInvalid && unit && unit.ratio !== 1 && priceNum > 0
                    ? `${veg.unit} ${formatNumber(pricePerUnit)}원으로 계산했어요${unit.note ? ` · ${unit.note}` : ""}`
                    : undefined
                }
              >
                <TextFieldInput inputMode="numeric" placeholder="예: 3000" />
              </TextField>
            </section>
          )}
        </div>
      </Scroll>

      {/* 판단이 끝나면 제보로 — 가격을 이미 입력했으니 추가 입력이 거의 없다.
          하단바는 **항상** 렌더한다: 조건부로 나타나면 판정 순간 화면이 위로 튄다(입력 중 레이아웃 점프). */}
      <BottomBar>
        {canReport ? (
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
