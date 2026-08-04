"use client";

import { type ChangeEvent, type FormEvent, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import IconCameraLine from "@karrotmarket/react-monochrome-icon/IconCameraLine";
import IconXmarkLine from "@karrotmarket/react-monochrome-icon/IconXmarkLine";
import { TextField, TextFieldInput } from "seed-design/ui/text-field";
import { ActionButton } from "seed-design/ui/action-button";
import { AppBar, BottomBar, PhoneFrame, Scroll } from "../_lib/shell";
import { getVegetable } from "../_lib/vegetables";
import { useCurrentDistrict } from "../_lib/location";
import { addReport } from "../_lib/reports-store";
import { LocationPickerSheet } from "./location-picker-sheet";
import { VegetablePickerSheet } from "./vegetable-picker-sheet";
import type { Report, Vegetable } from "../_lib/types";

/**
 * 사진 인식 결과(데모 고정값) — UT에서는 어떤 사진을 넣어도 감자 1kg 3,000원으로 읽힌다.
 * 실서비스에서는 이 상수 자리에 인식 API 응답이 들어온다. 화면 로직은 그대로 쓸 수 있게
 * "인식 결과를 받아 폼을 채운다"는 형태만 지킨다.
 */
const PHOTO_RECOGNITION = { vegetableId: "potato", weight: "1", price: "3000" };

// F04-2 야채 제보 폼 — 위치·품목은 시트에서 고른 값을 상단 요약 칩으로 고정 표시(자유 편집 금지),
// 실제로 입력할 값(양·가격)만 필드로 남긴다. 확인 → localStorage 저장 → 제보 완료(F04-3).
// 확인 버튼은 유효할 때만 활성(Figma) → 별도 에러 문구 없이 비활성으로 안내.
//
// 2026-08-04 개편 두 가지.
//  ① 「이 가격에 구매하셨나요?」(구매 여부) 삭제 — 구매 인증 개념 자체를 버리고 제보로 간다.
//     "샀는지"는 동네 시세에 아무 영향이 없는데도 마이페이지 금액 지표의 입력이라 물었던 값이다.
//  ② 사진이 갈림길이 아니라 이 화면 안의 선택 입력이 됐다. 예전엔 「어떻게 제보할까요?」 시트에서
//     촬영/직접입력을 먼저 고르게 했는데, 사진을 고른 사람도 결국 이 폼을 채웠다 — 갈림길이
//     한 단계를 늘리기만 했다. 지금은 폼에 들어와서 사진을 넣으면 값이 채워지고(위 상수),
//     나머지만 손으로 적는다. 사진 없이도 제보는 완료된다(사진은 선택 정보).
export function ReportForm({
  item,
  method,
  place,
  prefillPrice = "",
  prefillWeight = "",
}: {
  item: string;
  /** 진입 시점의 입력 경로. 폼에서 사진을 넣으면 photo로 승격된다. */
  method: Report["method"];
  place: string;
  /** 다른 화면에서 이미 입력한 가격 — 있으면 다시 묻지 않는다 */
  prefillPrice?: string;
  /** 이미 정해진 수량(기준 단위 환산) */
  prefillWeight?: string;
}) {
  const router = useRouter();
  const { district, loading } = useCurrentDistrict();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedVeg, setSelectedVeg] = useState<Vegetable | undefined>(getVegetable(item));
  const [weight, setWeight] = useState(prefillWeight);
  const [price, setPrice] = useState(prefillPrice);
  // 위치 — 시트에서 고른 값만 채택한다(자유 텍스트 편집 금지). 완료 화면에서 넘어온 place는 기본값.
  const [placeValue, setPlaceValue] = useState(place);
  // 사진 미리보기 URL(objectURL). 프로토타입이라 파일 자체는 저장하지 않는다 —
  // localStorage에 이미지를 넣으면 용량 한도에 금방 걸린다.
  const [photoUrl, setPhotoUrl] = useState("");

  const veg = selectedVeg;
  const weightNum = Number(weight.replace(/[^0-9.]/g, ""));
  const priceNum = Number(price.replace(/[^0-9]/g, ""));
  const formValid = !!veg && !!placeValue.trim() && weightNum > 0 && priceNum > 0 && !loading;
  // 연속 입력 진입(`/prototype/report?place=…`)은 item이 없다 — 품목을 고르기 전에 닫으면
  // `/prototype/price/`(빈 세그먼트, 404)가 되지 않게 홈으로 폴백.
  const closeHref = veg ? `/prototype/price/${veg.id}` : "/prototype";

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    // 이전 미리보기 URL은 해제한다(같은 화면에서 사진을 여러 번 바꿀 수 있다).
    if (photoUrl) URL.revokeObjectURL(photoUrl);
    setPhotoUrl(URL.createObjectURL(file));

    // 인식 결과로 폼을 채운다. 사용자가 이미 손으로 적어둔 값은 덮지 않는다 —
    // 사진을 나중에 넣었다고 방금 고쳐 쓴 가격이 사라지면 안 된다.
    const recognized = getVegetable(PHOTO_RECOGNITION.vegetableId);
    if (recognized && !selectedVeg) setSelectedVeg(recognized);
    if (!weight.trim()) setWeight(PHOTO_RECOGNITION.weight);
    if (!price.trim()) setPrice(PHOTO_RECOGNITION.price);
  }

  function clearPhoto() {
    if (photoUrl) URL.revokeObjectURL(photoUrl);
    setPhotoUrl("");
    // 같은 파일을 다시 고를 수 있게 input 값을 비운다(값이 같으면 change가 안 뜬다).
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleSubmit(event?: FormEvent) {
    event?.preventDefault();
    if (!formValid || !veg) return;
    addReport({
      vegetableId: veg.id,
      district,
      place: placeValue.trim() || undefined,
      weightKg: weightNum,
      price: priceNum,
      // 사진을 넣었으면 사진 제보로 기록한다(진입 경로보다 실제 입력이 우선).
      method: photoUrl ? "photo" : method,
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

          {/* 사진(선택) — 맨 위에 둔다. 넣으면 아래 값이 채워지므로 순서상 먼저 와야 한다. */}
          <div className="mt-6 flex flex-col gap-2">
            <p className="text-body-14-medium text-fg-neutral">
              사진 <span className="text-fg-neutral-muted">(선택)</span>
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoChange}
              className="sr-only"
              id="report-photo"
            />
            {photoUrl ? (
              <div className="relative w-fit">
                {/* 사용자가 방금 고른 로컬 파일(objectURL)이라 next/image 최적화 대상이 아니다 */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photoUrl}
                  alt="방금 고른 야채 사진"
                  className="size-28 rounded-2xl object-cover"
                />
                <button
                  type="button"
                  onClick={clearPhoto}
                  aria-label="사진 지우기"
                  className="absolute -right-2 -top-2 flex size-8 items-center justify-center rounded-full bg-bg-neutral-inverted text-fg-neutral-inverted [&_svg]:size-4"
                >
                  <IconXmarkLine />
                </button>
              </div>
            ) : (
              <label
                htmlFor="report-photo"
                className="flex h-28 w-28 flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-bg-neutral-weak-pressed text-fg-neutral-muted active:bg-bg-neutral-weak"
              >
                <span className="[&_svg]:size-6" aria-hidden="true">
                  <IconCameraLine />
                </span>
                <span className="text-caption-12-regular">사진 넣기</span>
              </label>
            )}
            <p className="text-caption-12-regular text-fg-neutral-muted">
              사진을 넣으면 품목과 가격을 자동으로 채워드려요
            </p>
          </div>

          {/* 이미 정해진 값(위치·품목)은 요약 칩으로 접는다 — 실제로 입력할 양·가격이 주인공이다. */}
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <LocationPickerSheet value={placeValue} onSelect={setPlaceValue} />
            <VegetablePickerSheet value={veg} onSelect={setSelectedVeg} />
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
