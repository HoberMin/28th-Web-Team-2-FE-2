import { CardNews } from "../../_components/card-news";
import type { Story } from "./types";

// Figma `card/news` node 253-2136, sync 2026-08-08. Variant 없음.
// 가로 캐러셀에 놓이는 카드라, 여러 장을 나란히 둔 모습까지 함께 본다.
//
// ⚠️ 썸네일 사진은 Figma 에셋을 코드로 가져올 수 없어(에셋 다운로드 차단) 자리표시로 대신했다.

function ThumbnailPlaceholder() {
  return (
    <span className="flex size-full items-center justify-center bg-surface-secondary text-caption-12-regular text-content-disabled">
      사진
    </span>
  );
}

const NEWS = [
  { title: "양파 가격 폭락에 농가 울상...'상생' 할인 판매", date: "2026.08.01" },
  { title: "장마 끝, 상추 값 다시 오름세", date: "2026.07.28" },
  {
    title: "이번 주 도매시장 시세 요약 — 배추와 무는 내리고 고추는 올랐습니다",
    date: "2026.07.25",
  },
];

function CardNewsStory() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-body-14-semibold text-content-primary">기본</p>
        <CardNews thumbnail={<ThumbnailPlaceholder />} title={NEWS[0].title} date={NEWS[0].date} />
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-body-14-semibold text-content-primary">나란히 놓인 모습</p>
        <div className="flex gap-3 overflow-x-auto no-scrollbar">
          {NEWS.map((news) => (
            <CardNews
              key={news.title}
              thumbnail={<ThumbnailPlaceholder />}
              title={news.title}
              date={news.date}
            />
          ))}
        </div>
        <p className="text-caption-12-regular text-content-secondary">
          제목이 길어도 두 줄에서 잘려서, 카드 높이가 서로 어긋나지 않아요.
        </p>
      </div>
    </div>
  );
}

export const cardNewsStory: Story = {
  id: "card-news",
  title: "Card News",
  group: "컴포넌트",
  figma: "node 253-2136",
  description: "사진·제목·날짜로 된 뉴스 카드예요. 가로로 넘겨 봐요.",
  Component: CardNewsStory,
};
