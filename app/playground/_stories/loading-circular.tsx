import { LoadingCircular } from "../../_components/loading-circular";
import type { Story } from "./types";

// Figma `loading/circular` node 436-25632, sync 2026-08-08. 신규 컴포넌트.
// Figma 심볼은 2개(animate=false · animate=true)라 그 2개만 나열한다.
// 색은 놓인 자리의 글자색을 그대로 따라가므로, 어두운 배경 위 모습도 같이 보여 준다.

function LoadingCircularStory() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-body-14-semibold text-content-primary">두 가지 모습</p>
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex flex-col items-center gap-1.5 text-content-primary">
            <LoadingCircular />
            <span className="text-caption-12-regular text-content-secondary">멈춤</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 text-content-primary">
            <LoadingCircular animate />
            <span className="text-caption-12-regular text-content-secondary">회전</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-body-14-semibold text-content-primary">놓인 자리의 글자색을 따라가요</p>
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-2 rounded-md bg-action-primary-default px-3 py-2 text-content-inverse">
            <LoadingCircular animate />
            <span className="text-body-14-semibold">밝은 글자 위</span>
          </span>
          <span className="flex items-center gap-2 rounded-md bg-action-tertiary-default px-3 py-2 text-content-secondary">
            <LoadingCircular animate />
            <span className="text-body-14-semibold">어두운 글자 위</span>
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-body-14-semibold text-content-primary">혼자 쓸 때</p>
        <div className="flex items-center gap-2 text-content-secondary">
          <LoadingCircular animate label="불러오는 중" />
          <span className="text-body-14-regular">불러오는 중</span>
        </div>
        <p className="text-caption-12-regular text-content-secondary">
          버튼 안이 아니라 화면에 혼자 놓일 때는 설명을 함께 줘서 무엇을 기다리는지 알리게 했어요.
        </p>
      </div>
    </div>
  );
}

export const loadingCircularStory: Story = {
  id: "loading-circular",
  title: "Loading Circular",
  group: "컴포넌트",
  figma: "node 436-25632",
  description: "무언가를 기다리는 동안 도는 동그란 표시예요.",
  Component: LoadingCircularStory,
};
