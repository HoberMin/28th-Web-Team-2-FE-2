import { TextField } from "../../_components/text-field";
import type { Story } from "./types";

// Figma `field/text` node 237-8556, sync 2026-08-05. Property 1 = normal | typing.
// 라벨에 Figma가 바인딩한 변수명을 적어 두어 구현이 다른 토큰으로 새면 잡히게 했다.

function TextFieldStory() {
  return (
    <div className="flex flex-col gap-6">
      <p className="text-caption-12-regular text-content-secondary">
        Figma 규격: 높이 52px · 좌우 여백 16px · radius/lg(12px) · 배경 surface/secondary ·
        body/16-medium.
      </p>

      {/* Figma 원본 폭 358px은 모바일 프레임(390) 좌우 여백을 뺀 값 = 레이아웃 맥락이라
          컴포넌트가 아니라 부모가 정한다. 여기서는 w-full로 컨테이너를 따라간다. */}
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <p className="text-body-14-semibold text-content-primary">normal (비어 있을 때)</p>
          <p className="text-caption-12-regular text-content-secondary">
            안내 문구 content/disabled · 우측 아이콘 icon/search
          </p>
          <TextField placeholder="찾는 야채 있으신가요?" aria-label="야채 검색" />
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-body-14-semibold text-content-primary">typing (값이 있을 때)</p>
          <p className="text-caption-12-regular text-content-secondary">
            입력값 content/primary · 우측 아이콘 icon/close-fill
          </p>
          <TextField defaultValue="당근당근" aria-label="야채 검색" />
        </div>
      </div>

      <div className="flex flex-col gap-2 rounded-md bg-surface-secondary px-4 py-3">
        <p className="text-body-14-semibold text-content-primary">아직 안 된 부분</p>
        <ul className="flex list-disc flex-col gap-1 pl-4 text-caption-12-regular text-content-secondary">
          <li>
            우측 아이콘(돋보기·지우기)이 비어 있어요. Figma 아이콘 SVG를 코드로 못 가져오고 있어서
            자리만 열어둔 상태예요 — SVG를 따로 넘겨주시면 채웁니다.
          </li>
          <li>
            눌렀을 때(focus) 모습이 Figma에 없어서 브라우저 기본 테두리를 그대로 뒀어요. 키보드로
            쓰는 분들에게 필요한 표시라 지우지 않았습니다. 디자인이 정해지면 바꿀게요.
          </li>
          <li>
            안내 문구 대비가 1.74:1이라 잘 안 보여요(기준 4.5:1). Figma 원본 값이라 그대로 뒀으니
            한 단계 진한 회색이 필요한지 봐주세요.
          </li>
          <li>
            Figma에서 이 글자 스타일이 아직 옛 Pretendard 설정(줄간격 1.5·자간 -3%)으로 잡혀
            있어요. 코드는 최종 타이포(Wanted Sans · 1.55 · -2%)를 따랐습니다.
          </li>
        </ul>
      </div>
    </div>
  );
}

export const textFieldStory: Story = {
  id: "text-field",
  title: "Text Field",
  group: "컴포넌트",
  figma: "node 237-8556",
  description: "검색어처럼 짧은 글을 입력받는 칸이에요.",
  Component: TextFieldStory,
};
