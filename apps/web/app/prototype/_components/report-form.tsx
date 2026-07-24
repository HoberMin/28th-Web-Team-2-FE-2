"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { TextField, TextFieldInput } from "seed-design/ui/text-field";
import { ActionButton } from "seed-design/ui/action-button";
import { AppBar, BottomBar, PhoneFrame, Scroll, StatusBar } from "../_lib/shell";
import { DEFAULT_DISTRICT, getVegetable, VEGETABLES } from "../_lib/vegetables";
import { addReport } from "../_lib/reports-store";
import type { Report } from "../_lib/types";

// F04 야채 제보 — 위치·품목·무게·가격 → localStorage 저장 → 시세 화면 복귀(크라우드소싱 루프).
export function ReportForm({ item, method }: { item: string; method: Report["method"] }) {
  const router = useRouter();
  const presetVeg = getVegetable(item);

  const [district, setDistrict] = useState(DEFAULT_DISTRICT);
  const [itemName, setItemName] = useState(presetVeg?.name ?? "");
  const [weight, setWeight] = useState("");
  const [price, setPrice] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const veg = presetVeg ?? VEGETABLES.find((v) => v.name === itemName.trim());
  const weightNum = Number(weight.replace(/[^0-9.]/g, ""));
  const priceNum = Number(price.replace(/[^0-9]/g, ""));

  const errors = {
    district: district.trim().length === 0,
    item: !veg,
    weight: !(weightNum > 0),
    price: !(priceNum > 0),
  };
  const hasError = Object.values(errors).some(Boolean);
  const closeHref = presetVeg ? `/prototype/price/${presetVeg.id}` : "/prototype";

  function handleSubmit(event?: FormEvent) {
    event?.preventDefault();
    setSubmitted(true);
    if (hasError || !veg) return;
    addReport({
      vegetableId: veg.id,
      district: district.trim(),
      weightKg: weightNum,
      price: priceNum,
      method,
    });
    router.push(`/prototype/price/${veg.id}`);
  }

  return (
    <PhoneFrame>
      <StatusBar />
      <AppBar backHref={closeHref} />
      <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
      <Scroll className="px-4 pb-6">
        <h1 className="text-head2-20 leading-snug text-fg-neutral">
          야채의 실제 가격을
          <br />
          알려주세요
        </h1>
        {method === "photo" && (
          <p className="mt-2 text-body-14-regular text-fg-neutral-subtle">
            촬영한 사진을 확인하고 값을 채워주세요.
          </p>
        )}

        <div className="mt-8 flex flex-col gap-6">
          {/* 위치는 UT 시나리오상 광진구 고정 — 시세 화면 필터(광진구)와 어긋나 제보가 사라지는 혼란 방지. */}
          <TextField
            label="위치"
            value={district}
            onValueChange={(v) => setDistrict(v.value)}
            readOnly
          >
            <TextFieldInput />
          </TextField>

          <TextField
            label="품목"
            value={itemName}
            onValueChange={(v) => setItemName(v.value)}
            readOnly={!!presetVeg}
            invalid={submitted && errors.item}
            errorMessage="목록에 있는 야채 이름을 입력해 주세요"
          >
            <TextFieldInput placeholder="예: 감자" />
          </TextField>

          <TextField
            label="양(무게)"
            value={weight}
            onValueChange={(v) => setWeight(v.value)}
            suffix="kg"
            invalid={submitted && errors.weight}
            errorMessage="무게를 입력해 주세요"
          >
            <TextFieldInput placeholder="0" inputMode="decimal" />
          </TextField>

          <TextField
            label="가격"
            value={price}
            onValueChange={(v) => setPrice(v.value)}
            suffix="원"
            invalid={submitted && errors.price}
            errorMessage="가격을 입력해 주세요"
          >
            <TextFieldInput placeholder="0" inputMode="numeric" />
          </TextField>
        </div>
      </Scroll>

      <BottomBar>
        <ActionButton type="submit" variant="brandSolid" size="large" className="w-full">
          확인
        </ActionButton>
      </BottomBar>
      </form>
    </PhoneFrame>
  );
}
