import Link from "next/link";
import IconChevronRightLine from "@karrotmarket/react-monochrome-icon/IconChevronRightLine";
import { AppBar, PhoneFrame, Scroll } from "../_lib/shell";
import { CARD_NEWS, CARD_NEWS_AS_OF } from "../_lib/card-news";
import { getVegetable } from "../_lib/vegetables";
import type { Vegetable } from "../_lib/types";
import { formatDateDot, getDiffColorToken } from "../_lib/format";
import { VegetableThumb } from "../_components/vegetable-thumb";
import { EmptyState } from "../_components/empty-state";

// F08 가격 등락 카드뉴스 — RSC, 인터랙션 없어 전체 서버 렌더.
export default function CardNewsPage() {
  // 품목을 못 찾는 글은 렌더하지 않는다 — 예전엔 그런 글도 링크가 살아 있어 누르면 조용히
  // 홈으로 튕겼다(백로그 「죽은 링크」). 전부 못 찾으면 빈 상태로 떨어진다(백로그 「빈 상태」).
  const news = CARD_NEWS.map((item) => ({ item, veg: getVegetable(item.vegetableId) })).filter(
    (entry): entry is { item: (typeof CARD_NEWS)[number]; veg: Vegetable } => entry.veg !== undefined,
  );

  return (
    <PhoneFrame>
      <AppBar title="시세 이야기" backHref="/prototype" />
      <Scroll className="pb-6">
        <div className="flex flex-col gap-3 px-4 pt-3">
          {/* 기준 시점 + 더미 표기 — 「한 달 새 12%」의 기준일을 화면 어디서도 알 수 없던 문제
              (백로그 F08). 홈·시세 화면과 같은 "예시 데이터" 표기로 통일한다. */}
          <p className="text-caption-12-regular text-content-secondary">
            {formatDateDot(CARD_NEWS_AS_OF)} 기준 · 예시 데이터
          </p>

          {news.length === 0 ? (
            <EmptyState>아직 준비된 시세 이야기가 없어요</EmptyState>
          ) : (
            news.map(({ item, veg }) => {
              const down = item.changePct < 0;
              return (
                <Link
                  key={item.id}
                  id={item.id}
                  href={`/prototype/price/${veg.id}`}
                  className="flex flex-col gap-2 rounded-2xl bg-gray-100 px-4 py-4 active:bg-gray-200"
                >
                  <div className="flex items-center gap-2">
                    <VegetableThumb image={veg.image} emoji={veg.emoji} size="md" />
                    <span className="flex min-w-0 flex-col">
                      <span className="text-body-16-semibold text-content-primary">{item.title}</span>
                      <span
                        className={`flex items-center gap-1 text-caption-12-regular ${getDiffColorToken(item.changePct)}`}
                      >
                        {/* changePct는 "한 달 새 등락"이다 — 시세 대비 전용인 formatDiff를 쓰면
                            "시세보다 N% 싸요"라는 거짓 문장이 된다(제목과도 모순). 수치만 표기. */}
                        <span aria-hidden="true">{down ? "▼" : "▲"}</span>
                        <span className="sr-only">{down ? "내림" : "오름"}, </span>
                        <span>{Math.abs(item.changePct)}%</span>
                      </span>
                    </span>
                  </div>
                  <p className="text-body-14-regular text-content-secondary">{item.body}</p>
                  {/* 읽고 나서 할 행동 — 카드가 "사기 좋은 시기"라 말해놓고 목적지가 없던 문제
                      (백로그 F08). 실제 이동지는 해당 품목 시세 화면이라 그렇게 읽히게 한다. */}
                  <span className="flex items-center gap-0.5 text-caption-12-regular text-orange-700">
                    {veg.name} 시세 보러 가기
                    <IconChevronRightLine className="size-3.5" aria-hidden="true" />
                  </span>
                </Link>
              );
            })
          )}
        </div>
      </Scroll>
    </PhoneFrame>
  );
}
