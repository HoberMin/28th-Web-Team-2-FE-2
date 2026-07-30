"use client";

import { ActionButton } from "seed-design/ui/action-button";
import { useMyReports } from "../_lib/reports-store";
import { addToBasket } from "../_lib/basket-store";
import { groupShoppingSessions } from "../_lib/repurchase";
import { formatDateDot, formatWon } from "../_lib/format";

// "지난 장보기 그대로 담기" — 반복 구매가 많은 타깃이라 매번 새로 담게 하는 건 노력 낭비다.
// 내 구매 이력을 날짜(=한 번의 장보기) 단위로 묶어 그대로 복원한다.
export function RepeatShopping({ limit = 2 }: { limit?: number }) {
  const myReports = useMyReports();
  const sessions = groupShoppingSessions(myReports, limit);

  if (sessions.length === 0) return null;

  return (
    <section aria-label="지난 장보기 다시 담기" className="flex flex-col gap-3">
      <h2 className="text-head2-16 text-fg-neutral">지난 장보기 그대로 담기</h2>
      <ul className="flex flex-col gap-2">
        {sessions.map((s) => (
          <li
            key={s.date}
            className="flex flex-col gap-3 rounded-2xl bg-bg-neutral-weak px-4 py-3"
          >
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-body-14-medium text-fg-neutral">
                {formatDateDot(s.date)} 장보기
              </span>
              <span className="text-caption-12-regular tabular-nums text-fg-neutral-subtle">
                그날 {formatWon(s.total)}
              </span>
            </div>
            <p className="text-caption-12-regular text-fg-neutral-subtle">
              {s.items.map((i) => `${i.name} ${i.weightKg}`).join(" · ")}
            </p>
            <ActionButton
              type="button"
              variant="neutralWeak"
              size="medium"
              className="w-full"
              onClick={() => {
                for (const i of s.items) addToBasket(i.vegetableId, i.weightKg);
              }}
            >
              {s.items.length}개 담기
            </ActionButton>
          </li>
        ))}
      </ul>
    </section>
  );
}
