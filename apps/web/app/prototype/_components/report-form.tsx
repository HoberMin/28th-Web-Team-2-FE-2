"use client";

import { type FormEvent, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { TextField, TextFieldInput } from "seed-design/ui/text-field";
import { ActionButton } from "seed-design/ui/action-button";
import { SegmentedControl, SegmentedControlItem } from "seed-design/ui/segmented-control";
import { AppBar, BottomBar, PhoneFrame, Scroll } from "../_lib/shell";
import { getVegetable } from "../_lib/vegetables";
import { useCurrentDistrict } from "../_lib/location";
import { addReport } from "../_lib/reports-store";
import { LocationPickerSheet } from "./location-picker-sheet";
import { VegetablePickerSheet } from "./vegetable-picker-sheet";
import type { Report, Vegetable } from "../_lib/types";

// 구매 여부 선택지 — "샀어요"만 구매 내역·시세 대비 절약에 잡히고, 둘 다 동네 시세엔 기여.
const PURCHASE_OPTIONS = [
  { key: "yes", label: "네, 샀어요" },
  { key: "no", label: "시세만 봤어요" },
] as const;

// F04-2 야채 제보 폼 — 위치·품목은 시트에서 고른 값을 상단 요약 칩으로 고정 표시(자유 편집 금지),
// 실제로 입력할 값(양·가격)만 필드로 남긴다. 확인 → localStorage 저장 → 제보 완료(F04-3).
// 확인 버튼은 유효할 때만 활성(Figma) → 별도 에러 문구 없이 비활성으로 안내.
export function ReportForm({
  item,
  method,
  place,
  prefillPrice = "",
  prefillWeight = "",
}: {
  item: string;
  method: Report["method"];
  place: string;
  /** 즉석 판단(F10)에서 이미 입력한 가격 — 있으면 다시 묻지 않는다 */
  prefillPrice?: string;
  /** 즉석 판단에서 고른 단위의 기준 단위 환산 수량 */
  prefillWeight?: string;
}) {
  const router = useRouter();
  // UT 데모: 사진 촬영은 항상 감자로 인식된다 → 품목을 감자로 고정(시트를 열지 않는다).
  const lockedVeg = method === "photo" ? getVegetable("potato") : undefined;
  const { district, loading } = useCurrentDistrict();

  const [selectedVeg, setSelectedVeg] = useState<Vegetable | undefined>(
    lockedVeg ?? getVegetable(item),
  );
  const veg = lockedVeg ?? selectedVeg;

  // 프리필 우선순위: 즉석 판단에서 넘어온 값 → 사진 촬영 데모(1kg·3000원 감자) → 빈 값.
  const [weight, setWeight] = useState(prefillWeight || (method === "photo" ? "1" : ""));
  const [price, setPrice] = useState(prefillPrice || (method === "photo" ? "3000" : ""));
  const [purchased, setPurchased] = useState(true);
  // 위치 — 시트에서 고른 값만 채택한다(자유 텍스트 편집 금지). 완료 화면에서 넘어온 place는 기본값.
  const [placeValue, setPlaceValue] = useState(place);

  const weightNum = Number(weight.replace(/[^0-9.]/g, ""));
  const priceNum = Number(price.replace(/[^0-9]/g, ""));
  const formValid = !!veg && !!placeValue.trim() && weightNum > 0 && priceNum > 0 && !loading;
  // 연속 입력 진입(`/prototype/report?place=…`)은 item이 없다 — 품목을 고르기 전에 닫으면
  // `/prototype/price/`(빈 세그먼트, 404)가 되지 않게 홈으로 폴백.
  const closeHref = veg ? `/prototype/price/${veg.id}` : "/prototype";

  function handleSubmit(event?: FormEvent) {
    event?.preventDefault();
    if (!formValid || !veg) return;
    addReport({
      vegetableId: veg.id,
      district,
      place: placeValue.trim() || undefined,
      weightKg: weightNum,
      price: priceNum,
      method,
      purchased,
    });
    // 가게명을 완료 화면까지 들고 간다 — 같은 가게의 다음 품목을 이어서 입력할 수 있게 한다.
    const placeParam = placeValue.trim() ? `&place=${encodeURIComponent(placeValue.trim())}` : "";
    router.push(`/prototype/report/success?item=${veg.id}${placeParam}`);
  }

  return (
    <PhoneFrame>
      <AppBar backHref={closeHref} />
      <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
        <Scroll className="px-4 pb-6">
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-head2-20 leading-snug text-fg-neutral">
              야채의 실제 가격을
              <br />
              알려주세요
            </h1>
            <Image src="/veg/cart.svg" alt="" width={99} height={97} className="mt-1 h-16 w-auto shrink-0 object-contain" />
          </div>

          {/* 이미 정해진 값(위치·품목)은 요약 칩으로 접는다 — 실제로 입력할 양·가격이 주인공이다. */}
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <LocationPickerSheet value={placeValue} onSelect={setPlaceValue} />
            <VegetablePickerSheet value={veg} onSelect={setSelectedVeg} disabled={!!lockedVeg} />
          </div>

          <div className="mt-6 flex flex-col gap-6">
            {/* 양 — 단위는 품목마다 다르다(kg·개·포기·g). 규격 §단위 정책을 그대로 따른다 */}
            <TextField
              label="양"
              value={weight}
              onValueChange={(v) => setWeight(v.value)}
              suffix={veg?.unitType ?? "kg"}
              description={veg ? `${veg.name}은 ${veg.unit} 기준으로 비교해요` : "먼저 품목을 골라주세요"}
            >
              <TextFieldInput placeholder="0" inputMode="decimal" />
            </TextField>

            {/* 가격 — 실제로 입력할 핵심 값이라 큰 숫자로 크기를 올린다 */}
            <TextField label="가격" value={price} onValueChange={(v) => setPrice(v.value)} suffix="원">
              <TextFieldInput placeholder="0" inputMode="numeric" className="text-head1-24 font-semibold" />
            </TextField>

            {/* 구매 여부 — 샀는지 / 시세만 봤는지. 샀을 때만 마이페이지 구매 내역·절약에 잡힘.
                랭킹·마이페이지와 같은 seed SegmentedControl을 쓴다(세 화면에 복붙돼 있던 마크업 제거) */}
            <div className="flex flex-col gap-2">
              <p className="text-body-14-medium text-fg-neutral">이 가격에 구매하셨나요?</p>
              <SegmentedControl
                aria-label="구매 여부"
                value={purchased ? "yes" : "no"}
                onValueChange={(v) => setPurchased(v === "yes")}
              >
                {PURCHASE_OPTIONS.map((opt) => (
                  <SegmentedControlItem key={opt.key} value={opt.key}>
                    {opt.label}
                  </SegmentedControlItem>
                ))}
              </SegmentedControl>
            </div>
          </div>
        </Scroll>

        <BottomBar>
          <ActionButton
            type="submit"
            variant="neutralSolid"
            size="large"
            className="w-full"
            disabled={!formValid}
          >
            확인
          </ActionButton>
        </BottomBar>
      </form>
    </PhoneFrame>
  );
}
