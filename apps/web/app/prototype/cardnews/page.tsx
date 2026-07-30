import Link from "next/link";
import { AppBar, PhoneFrame, Scroll } from "../_lib/shell";
import { CARD_NEWS } from "../_lib/card-news";
import { getVegetable } from "../_lib/vegetables";

// F08 가격 등락 카드뉴스 — 콘텐츠는 예시/더미(자동 요약 엔진 없음). RSC, 인터랙션 없어 전체 서버 렌더.
export default function CardNewsPage() {
  return (
    <PhoneFrame>
      <AppBar title="시세 이야기" backHref="/prototype" />
      <Scroll className="pb-6">
        <div className="flex flex-col gap-3 px-4 pt-3">
          <p className="text-caption-12-regular text-fg-neutral-muted">
            예시 콘텐츠예요. 실제로는 시세 변동을 자동으로 요약해 보여드려요.
          </p>
          {CARD_NEWS.map((news) => {
            const veg = getVegetable(news.vegetableId);
            const down = news.changePct < 0;
            return (
              <Link
                key={news.id}
                href={veg ? `/prototype/price/${veg.id}` : "/prototype"}
                className="flex flex-col gap-2 rounded-2xl bg-bg-neutral-weak px-4 py-4 active:bg-bg-neutral-weak-pressed"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[28px]" aria-hidden="true">
                    {veg?.emoji}
                  </span>
                  <span className="flex flex-col">
                    <span className="text-body-16-semibold text-fg-neutral">{news.title}</span>
                    <span className={`text-caption-12-regular ${down ? "text-fg-positive" : "text-fg-critical"}`}>
                      {down ? "▼" : "▲"} {Math.abs(news.changePct)}%
                    </span>
                  </span>
                </div>
                <p className="text-body-14-regular text-fg-neutral-muted">{news.body}</p>
              </Link>
            );
          })}
        </div>
      </Scroll>
    </PhoneFrame>
  );
}
