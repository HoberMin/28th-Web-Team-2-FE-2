"use client";

import { useState } from "react";
import { ActionButton } from "seed-design/ui/action-button";
import { addToBasket } from "../_lib/basket-store";
import type { VegetableUnit } from "../_lib/types";
import { QuantityStepper } from "./quantity-stepper";

// 장바구니 담기 — F03에서 수량을 정해 담는다. 실 구매가 아니라 "장보기 전 예산 계획" 용도.
// 단위는 품목마다 다르다(kg·개·포기·g) → 스테퍼가 unitType을 받아 표기한다.
export function AddToBasketButton({
  vegetableId,
  vegetableName,
  unitType,
}: {
  vegetableId: string;
  vegetableName: string;
  unitType: VegetableUnit;
}) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addToBasket(vegetableId, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="flex items-center gap-2">
      <div className="rounded-full bg-bg-neutral-weak p-0.5">
        <QuantityStepper
          quantity={quantity}
          unitType={unitType}
          onChange={setQuantity}
          itemName={vegetableName}
        />
      </div>
      <ActionButton
        type="button"
        variant="neutralSolid"
        size="medium"
        className="flex-1"
        onClick={handleAdd}
      >
        {added ? "담았어요" : "장바구니에 담기"}
      </ActionButton>
      {/* 담김 결과를 스크린리더에도 알린다 — 버튼 라벨 변화만으로는 안 읽힐 수 있다 */}
      <span role="status" aria-live="polite" className="sr-only">
        {added ? `${vegetableName} 장바구니에 담았어요` : ""}
      </span>
    </div>
  );
}
