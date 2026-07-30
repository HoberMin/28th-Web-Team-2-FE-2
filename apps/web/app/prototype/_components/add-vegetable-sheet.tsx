"use client";

import { ActionButton } from "seed-design/ui/action-button";
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
        {/* "더 담기"는 보조 액션이다 — 장바구니의 주 CTA(장보기 시작하기, brandSolid)와
            solid로 경쟁하지 않게 neutralWeak. 이전엔 손으로 만든 h-12 rounded-full 이라
            같은 앱에 solid 버튼 생김새가 세 종류였다. */}
        <ActionButton type="button" variant="neutralWeak" size="large" className="w-full">
          + 야채 담기
        </ActionButton>
      </BottomSheetTrigger>
      <BottomSheetContent title="어떤 야채를 담을까요?">
        <BottomSheetBody className="pb-4">
          {options.length === 0 ? (
            <p className="py-8 text-center text-body-14-regular text-fg-neutral-muted">
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
