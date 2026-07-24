"use client";

import { type FormEvent, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { TextField, TextFieldInput } from "seed-design/ui/text-field";
import { ActionButton } from "seed-design/ui/action-button";
import { AppBar, BottomBar, PhoneFrame, Scroll } from "../_lib/shell";
import { getVegetable, VEGETABLES } from "../_lib/vegetables";
import { useCurrentDistrict } from "../_lib/location";
import { addReport } from "../_lib/reports-store";
import type { Report } from "../_lib/types";

// 구매 여부 선택지 — "샀어요"만 구매 내역·시세 대비 절약에 잡히고, 둘 다 동네 시세엔 기여.
const PURCHASE_OPTIONS = [
  { value: true, label: "네, 샀어요" },
  { value: false, label: "시세만 봤어요" },
] as const;

// F04 야채 제보 — 위치는 GPS 자동, 나머지 직접 입력 → localStorage 저장 → 시세 화면 복귀.
// 확인 버튼은 유효할 때만 활성(Figma) → 별도 에러 문구 없이 비활성으로 안내.
export function ReportForm({ item, method }: { item: string; method: Report["method"] }) {
  const router = useRouter();
  // UT 데모: 사진 촬영은 항상 감자로 인식된다 → 품목을 감자로 고정(읽기 전용).
  const presetVeg = method === "photo" ? getVegetable("potato") : getVegetable(item);
  const { district, loading } = useCurrentDistrict();

  // 사진 촬영 데모: 이미지가 1kg·3000원 감자라 인식 결과를 그대로 미리 채운다.
  const [itemName, setItemName] = useState(presetVeg?.name ?? "");
  const [weight, setWeight] = useState(method === "photo" ? "1" : "");
  const [price, setPrice] = useState(method === "photo" ? "3000" : "");
  const [purchased, setPurchased] = useState(true);

  const veg = presetVeg ?? VEGETABLES.find((v) => v.name === itemName.trim());
  const weightNum = Number(weight.replace(/[^0-9.]/g, ""));
  const priceNum = Number(price.replace(/[^0-9]/g, ""));
  const formValid = !!veg && weightNum > 0 && priceNum > 0 && !loading;
  const closeHref = presetVeg ? `/prototype/price/${presetVeg.id}` : "/prototype";

  function handleSubmit(event?: FormEvent) {
    event?.preventDefault();
    if (!formValid || !veg) return;
    addReport({ vegetableId: veg.id, district, weightKg: weightNum, price: priceNum, method, purchased });
    router.push(`/prototype/report/success?item=${veg.id}`);
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

          <div className="mt-8 flex flex-col gap-6">
            {/* 위치 — GPS 자동, 잠금 */}
            <TextField label="위치" value={loading ? "위치 확인 중…" : district} onValueChange={() => {}} readOnly>
              <TextFieldInput />
            </TextField>

            <TextField
              label="품목"
              value={itemName}
              onValueChange={(v) => setItemName(v.value)}
              readOnly={!!presetVeg}
            >
              <TextFieldInput placeholder="예: 감자" />
            </TextField>

            <TextField label="양(무게)" value={weight} onValueChange={(v) => setWeight(v.value)} suffix="kg">
              <TextFieldInput placeholder="0" inputMode="decimal" />
            </TextField>

            <TextField label="가격" value={price} onValueChange={(v) => setPrice(v.value)} suffix="원">
              <TextFieldInput placeholder="0" inputMode="numeric" />
            </TextField>

            {/* 구매 여부 — 샀는지 / 시세만 봤는지. 샀을 때만 마이페이지 구매 내역·절약에 잡힘 */}
            <fieldset className="flex flex-col gap-2 border-0 p-0">
              <legend className="mb-2 text-body-14-medium text-fg-neutral">이 가격에 구매하셨나요?</legend>
              <div role="group" className="flex gap-1 rounded-xl bg-bg-neutral-weak p-1">
                {PURCHASE_OPTIONS.map((opt) => {
                  const selected = purchased === opt.value;
                  return (
                    <button
                      key={opt.label}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setPurchased(opt.value)}
                      className={`min-h-11 flex-1 rounded-lg py-2 text-body-14-medium transition-colors ${
                        selected ? "bg-bg-layer-default text-fg-neutral shadow-sm" : "text-fg-neutral-subtle"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </fieldset>
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
