import { Button, type ButtonVariant } from "../../_components/button";
import type { Story } from "./types";

// Figma `button/cta` node 160-2855, sync 2026-08-05.
// Variant 3 × State 3 = 9종 전부 나열한다. 라벨에 Figma가 바인딩한 변수명을 적어 두어,
// 구현이 다른 토큰으로 새면 표와 화면이 어긋나 잡히게 했다 (design-guide §0의 검산면 역할).

const VARIANTS: { variant: ButtonVariant; label: string; bg: string; fg: string }[] = [
  {
    variant: "primary",
    label: "primary",
    bg: "action-primary/default · pressed · disabled",
    fg: "content/inverse",
  },
  {
    variant: "secondary",
    label: "secondary",
    // ⚠️ pressed만 action-secondary/pressed가 아니라 content/secondary에 바인딩돼 있다 (Figma 원본).
    bg: "action-secondary/default · content/secondary(pressed) · action-secondary/disabled",
    fg: "content/inverse",
  },
  {
    variant: "tertiary",
    label: "tertiary",
    bg: "action-tertiary/default · pressed · disabled",
    fg: "content/secondary",
  },
];

function ButtonStory() {
  return (
    <div className="flex flex-col gap-6">
      <p className="text-caption-12-regular text-content-secondary">
        Figma 규격: 좌우 여백 28px · 위아래 12px · 아이콘 간격 8px · radius/lg(12px) ·
        body/16-semibold. 아이콘은 leading·trailing 슬롯으로 열려 있고, Figma가 아이콘 SVG를
        아직 안 넘겨서 지금은 비어 있어요.
      </p>

      <div className="flex flex-col gap-5">
        {VARIANTS.map(({ variant, label, bg, fg }) => (
          <div key={variant} className="flex flex-col gap-2">
            <p className="text-body-14-semibold text-content-primary">{label}</p>
            <p className="text-caption-12-regular text-content-secondary">
              배경 {bg} / 글자 {fg}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex flex-col items-center gap-1.5">
                <Button variant={variant}>버튼</Button>
                <span className="text-caption-12-regular text-content-secondary">normal</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <Button variant={variant} state="pressed">
                  버튼
                </Button>
                <span className="text-caption-12-regular text-content-secondary">pressed</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <Button variant={variant} disabled>
                  버튼
                </Button>
                <span className="text-caption-12-regular text-content-secondary">disabled</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2 rounded-md bg-surface-secondary px-4 py-3">
        <p className="text-body-14-semibold text-content-primary">알아두면 좋은 것</p>
        <ul className="flex list-disc flex-col gap-1 pl-4 text-caption-12-regular text-content-secondary">
          <li>
            여기 pressed는 보여주려고 고정한 모습이에요. 실제 화면에서는 손가락으로 누르는 동안
            (<code>:active</code>) 자동으로 이 색이 됩니다.
          </li>
          <li>hover(마우스를 올렸을 때) 색은 Figma에 없어서 만들지 않았어요.</li>
          <li>
            대비: primary normal 2.43:1 · pressed 3.18:1 · tertiary normal 4.33:1 로 본문 기준
            4.5:1에 못 미쳐요. Figma 원본 값을 그대로 뒀으니 색 조정이 필요하면 Figma에서
            바꿔주세요.
          </li>
        </ul>
      </div>
    </div>
  );
}

export const buttonStory: Story = {
  id: "button",
  title: "Button (CTA)",
  group: "컴포넌트",
  figma: "node 160-2855",
  description: "화면에서 가장 중요한 행동을 누르게 하는 버튼이에요. 3가지 위계 × 3가지 상태.",
  Component: ButtonStory,
};
