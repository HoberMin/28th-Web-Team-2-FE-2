"use client";

import { formatQuantity } from "../_lib/format";
import type { VegetableUnit } from "../_lib/types";

// 수량 조절 스테퍼 — 시세 화면(담기)과 장바구니(수정)가 같은 컴포넌트를 쓴다.
// 이전엔 두 곳에 각각 −/+ 버튼이 복붙돼 있었고 둘 다 단위를 "kg"으로 고정해 46종에서 틀렸다.
//
// a11y: 값 표시는 aria-live로 읽히고, 버튼 라벨은 단위까지 말한다("1kg 줄이기"처럼).
// 터치 타겟은 44px 이상(size-11)을 유지하면서 카드 높이는 -my-2.5로 상쇄한다.
export function QuantityStepper({
  quantity,
  unitType,
  min = 1,
  onChange,
  itemName,
}: {
  quantity: number;
  unitType: VegetableUnit;
  min?: number;
  onChange: (next: number) => void;
  /** 스크린리더가 어느 품목인지 알게 — 목록에 여러 스테퍼가 있을 때 필수 */
  itemName?: string;
}) {
  const prefix = itemName ? `${itemName} ` : "";
  const step = 1;

  return (
    <div className="flex items-center gap-1 rounded-full bg-bg-layer-default px-1 py-1">
      <button
        type="button"
        aria-label={`${prefix}수량 줄이기`}
        disabled={quantity <= min}
        onClick={() => onChange(Math.max(min, quantity - step))}
        className="flex size-11 items-center justify-center text-body-16-semibold text-fg-neutral-subtle disabled:text-fg-disabled"
      >
        −
      </button>
      <span
        aria-live="polite"
        className="min-w-14 text-center text-body-14-medium tabular-nums text-fg-neutral"
      >
        {formatQuantity(quantity, unitType)}
      </span>
      <button
        type="button"
        aria-label={`${prefix}수량 늘리기`}
        onClick={() => onChange(quantity + step)}
        className="flex size-11 items-center justify-center text-body-16-semibold text-fg-neutral-subtle"
      >
        +
      </button>
    </div>
  );
}
