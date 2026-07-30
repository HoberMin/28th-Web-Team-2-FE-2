"use client";

import {
  BottomSheetBody,
  BottomSheetContent,
  BottomSheetRoot,
  BottomSheetTrigger,
} from "seed-design/ui/bottom-sheet";
import { VegetableThumb } from "./vegetable-thumb";
import { VEGETABLES } from "../_lib/vegetables";
import { addToBasket } from "../_lib/basket-store";

// 장바구니 화면에서 바로 담기 — 홈 그리드와 같은 9종을 바텀시트로. 탭 한 번에 1kg씩 담는다(수량은 담은 뒤 조절).
export function AddVegetableSheet({ excludeIds = [] }: { excludeIds?: string[] }) {
  const options = VEGETABLES.filter((v) => !excludeIds.includes(v.id));

  return (
    <BottomSheetRoot>
      <BottomSheetTrigger asChild>
        <button
          type="button"
          className="flex h-12 w-full items-center justify-center rounded-full bg-bg-neutral-inverted text-body-14-medium text-fg-neutral-inverted"
        >
          + 야채 담기
        </button>
      </BottomSheetTrigger>
      <BottomSheetContent title="어떤 야채를 담을까요?">
        <BottomSheetBody className="pb-4">
          {options.length === 0 ? (
            <p className="py-8 text-center text-body-14-regular text-fg-neutral-subtle">
              전부 담았어요
            </p>
          ) : (
            <ul className="grid grid-cols-3 gap-3">
              {options.map((v) => (
                <li key={v.id}>
                  <button
                    type="button"
                    aria-label={`${v.name} 1kg 담기`}
                    onClick={() => addToBasket(v.id, 1)}
                    className="flex w-full flex-col items-center gap-1.5 rounded-2xl bg-bg-neutral-weak py-4 active:bg-bg-neutral-weak-pressed"
                  >
                    <VegetableThumb image={v.image} emoji={v.emoji} size="lg" />
                    <span className="text-body-14-medium text-fg-neutral">{v.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </BottomSheetBody>
      </BottomSheetContent>
    </BottomSheetRoot>
  );
}
