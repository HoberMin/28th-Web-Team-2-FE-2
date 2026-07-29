"use client";

import { useState } from "react";
import { addToBasket } from "../_lib/basket-store";

// 장바구니 담기 — F03에서 수량(kg)을 정해 담는다. 실 구매가 아니라 "장보기 전 예산 계획" 용도.
export function AddToBasketButton({ vegetableId }: { vegetableId: string }) {
  const [weightKg, setWeightKg] = useState(1);
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addToBasket(vegetableId, weightKg);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-3 rounded-full bg-bg-neutral-weak px-3 py-1.5">
        <button
          type="button"
          aria-label="수량 줄이기"
          onClick={() => setWeightKg((v) => Math.max(1, v - 1))}
          className="flex size-11 -my-2.5 items-center justify-center text-body-16-semibold text-fg-neutral-subtle"
        >
          −
        </button>
        <span aria-live="polite" className="min-w-8 text-center text-body-14-medium text-fg-neutral">
          {weightKg}kg
        </span>
        <button
          type="button"
          aria-label="수량 늘리기"
          onClick={() => setWeightKg((v) => v + 1)}
          className="flex size-11 -my-2.5 items-center justify-center text-body-16-semibold text-fg-neutral-subtle"
        >
          +
        </button>
      </div>
      <button
        type="button"
        onClick={handleAdd}
        className="flex-1 rounded-full bg-bg-neutral-inverted py-2 text-center text-body-14-medium text-fg-neutral-inverted"
      >
        {added ? "담았어요" : "장바구니에 담기"}
      </button>
    </div>
  );
}
