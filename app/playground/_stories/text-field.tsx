import { TextField } from "../../_components/text-field";
import type { Story } from "./types";

// Figma `field/text` node 237-8556, sync 2026-08-05 → **재sync 2026-08-06**: Property 1에
// focused가 추가돼 normal | typing | focused 3종. 라벨에 Figma가 바인딩한 변수명을 적어 두어
// 구현이 다른 토큰으로 새면 잡히게 했다.

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

        <div className="flex flex-col gap-2">
          <p className="text-body-14-semibold text-content-primary">focused (눌렀을 때)</p>
          <p className="text-caption-12-regular text-content-secondary">
            Figma에 이 상태가 새로 생겼지만 실제로 확인해 보니 배경·테두리 전부 normal과 같아요.
            Figma 안에서는 깜빡이는 커서를 표현할 수 없어서 장식용 막대를 넣어둔 것뿐이고, 실제
            input은 포커스되면 브라우저가 커서를 알아서 그려줘요. 그래서 코드도 그대로 두고
            브라우저 기본 포커스 링(키보드 접근성용, WCAG 2.4.7)만 유지했어요. 아래 칸을 탭 또는
            클릭해서 포커스 링을 확인하세요.
          </p>
          <TextField placeholder="찾는 야채 있으신가요?" aria-label="야채 검색 (포커스 확인용)" />
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
            눌렀을 때(focus) 테두리 색으로 border/tertiary가 쓰였을 거라 짐작했는데, 실제로
            찾아보니 이 값이 어디에도 적용돼 있지 않았어요(Figma 값 확인 도구 둘이 서로 다른
            답을 줬고, 실제 화면을 만드는 쪽 기준으로는 미적용). 그래서 임의로 테두리를 넣지
            않고 브라우저 기본 테두리를 그대로 뒀어요 — 키보드로 쓰는 분들에게 필요한 표시라
            지우지 않았습니다. border/tertiary를 focus에 실제로 쓰실 계획이면 Figma에서
            테두리를 켜주세요.
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
