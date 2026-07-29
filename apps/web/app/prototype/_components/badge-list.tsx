import { getBadges } from "../_lib/badges";

// 뱃지 — 구매인증(제보)할 원동력. 제보/구매 건수로 계산, 획득한 것만 강조 표시.
export function BadgeList({ reportCount, purchaseCount }: { reportCount: number; purchaseCount: number }) {
  const badges = getBadges(reportCount, purchaseCount);
  const earnedCount = badges.filter((b) => b.earned).length;

  return (
    <section aria-label="뱃지" className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-body-16-semibold text-fg-neutral">뱃지</h2>
        <span className="text-caption-12-regular text-fg-neutral-subtle">{earnedCount}/{badges.length}</span>
      </div>
      <ul className="flex gap-2 overflow-x-auto">
        {badges.map((b) => (
          <li
            key={b.id}
            className={`flex shrink-0 flex-col items-center gap-1 rounded-2xl px-4 py-3 text-center ${
              b.earned ? "bg-bg-brand-weak" : "bg-bg-neutral-weak opacity-50"
            }`}
          >
            <span
              className={`flex size-10 items-center justify-center rounded-full text-body-16-semibold ${
                b.earned ? "bg-bg-brand text-fg-neutral-inverted" : "bg-bg-neutral-weak-pressed text-fg-neutral-subtle"
              }`}
              aria-hidden="true"
            >
              {b.label.slice(0, 1)}
            </span>
            <span className="w-20 text-caption-12-regular text-fg-neutral">{b.label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
