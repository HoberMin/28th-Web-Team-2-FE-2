import { BadgeMore } from "../../_components/badge-more";
import type { Story } from "./types";

// Figma `badge/more` node 185-1912, sync 2026-08-05. Variant 없음 — 숫자만 바뀐다.

function BadgeMoreStory() {
  return (
    <div className="flex flex-col gap-6">
      <p className="text-caption-12-regular text-content-secondary">
        Figma 규격: 48×48 슬롯 안 36×36 원(common/black5) + caption/12-bold
        (content/brand/medium). Figma 원본 예시는 <strong>+7</strong>이에요.
      </p>

      <div className="flex flex-wrap items-center gap-6">
        {[7, 12, 99].map((count) => (
          <div key={count} className="flex flex-col items-center gap-2">
            <BadgeMore count={count} />
            <p className="text-caption-12-regular text-content-secondary">+{count}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-body-14-semibold text-content-primary">쓰이는 자리</p>
        <div className="flex w-fit items-center gap-1 rounded-md border border-border-primary px-3 py-2">
          <span className="flex size-12 items-center justify-center rounded-md bg-surface-secondary text-caption-12-regular text-content-disabled">
            야채
          </span>
          <span className="flex size-12 items-center justify-center rounded-md bg-surface-secondary text-caption-12-regular text-content-disabled">
            야채
          </span>
          <BadgeMore count={7} />
        </div>
        <p className="text-caption-12-regular text-content-secondary">
          야채 아이콘 줄 끝에 붙어요. 옆 칸(48×48)과 크기를 맞추려고 배지도 48×48 슬롯을 그대로
          들고 있어요. 회색 칸은 야채 일러스트 자리를 대신 표시한 거예요 — 일러스트 에셋은 아직
          코드로 못 가져왔어요.
        </p>
      </div>

      <div className="flex flex-col gap-2 rounded-md bg-surface-secondary px-4 py-3">
        <p className="text-body-14-semibold text-content-primary">알아두면 좋은 것</p>
        <ul className="flex list-disc flex-col gap-1 pl-4 text-caption-12-regular text-content-secondary">
          <li>
            텍스트 대비는 흰 배경 기준 4.94:1로 본문 기준(4.5:1)을 넘어요. 어두운 배경 위에 올릴
            계획이라면 다시 봐야 해요(배경이 반투명 검정 5%라 밑색을 그대로 탑니다).
          </li>
          <li>
            스크린리더에는 &ldquo;그 외 7개&rdquo;로 읽혀요. 다른 문구가 필요하면{" "}
            <code>label</code>로 바꿀 수 있어요.
          </li>
        </ul>
      </div>
    </div>
  );
}

export const badgeMoreStory: Story = {
  id: "badge-more",
  title: "Badge More",
  group: "컴포넌트",
  figma: "node 185-1912",
  description: "야채 아이콘 줄 끝에서 남은 개수를 알리는 +N 배지예요.",
  Component: BadgeMoreStory,
};
