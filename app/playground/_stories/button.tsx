import { Button, type ButtonSize, type ColorVariant } from "../../_components/button";
import type { Story } from "./types";

// Figma `button/cta_md` node 160-2855, sync 2026-08-05 → **재sync 2026-08-06**.
// 프레임 심볼은 정확히 14개다: medium은 색상 3종 × state 3종(normal·pressed·disabled)=9개,
// small은 색상 3종 × normal만=3개, outlined는 medium·small 각 normal만=2개. 나열도 이 14개만
// 그대로 보여준다 — small의 pressed·disabled는 Figma 원본이 없어서 만들지 않았다
// (2026-08-06 리뷰에서 없는 조합 6개를 만들어 보여주고 있던 걸 발견해 제거함 — design-guide
// §1-1 "Figma에 있는 규격만 등록한다" 위반이었다).
// 라벨에 Figma가 바인딩한 변수명을 적어 두어, 구현이 다른 토큰으로 새면 표와 화면이 어긋나
// 잡히게 했다 (design-guide §0의 검산면 역할).

const COLOR_VARIANTS: { variant: ColorVariant; label: string; bg: string; fg: string }[] = [
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

// Figma에 실제로 있는 state만 size별로 다르다 — medium은 3종, small은 normal만.
const SIZES: { size: ButtonSize; label: string; states: ("normal" | "pressed" | "disabled")[] }[] = [
  {
    size: "medium",
    label: "medium (px-7 py-3 · radius/lg · body-16-semibold)",
    states: ["normal", "pressed", "disabled"],
  },
  {
    size: "small",
    label: "small (px-5 py-2 · radius/md · body-14-semibold) — Figma에 normal만 있어요",
    states: ["normal"],
  },
];

function ButtonStory() {
  return (
    <div className="flex flex-col gap-6">
      <p className="text-caption-12-regular text-content-secondary">
        Figma 규격: medium은 좌우 28px/위아래 12px, small은 좌우 20px/위아래 8px — 둘 다 아이콘
        간격은 size별로 8px(medium)·4px(small). radius는 medium이 radius/lg(12px), small이
        radius/md(8px). 아이콘은 leading·trailing 슬롯으로 열려 있고, Figma가 아이콘 SVG를 아직
        안 넘겨서 지금은 비어 있어요.
      </p>

      <div className="flex flex-col gap-6">
        {COLOR_VARIANTS.map(({ variant, label, bg, fg }) => (
          <div key={variant} className="flex flex-col gap-3">
            <p className="text-body-14-semibold text-content-primary">{label}</p>
            <p className="text-caption-12-regular text-content-secondary">
              배경 {bg} / 글자 {fg}
            </p>
            {SIZES.map(({ size, label: sizeLabel, states }) => (
              <div key={size} className="flex flex-col gap-2">
                <p className="text-caption-12-semibold text-content-secondary">{sizeLabel}</p>
                <div className="flex flex-wrap items-center gap-3">
                  {states.includes("normal") && (
                    <div className="flex flex-col items-center gap-1.5">
                      <Button variant={variant} size={size}>
                        버튼
                      </Button>
                      <span className="text-caption-12-regular text-content-secondary">
                        normal
                      </span>
                    </div>
                  )}
                  {states.includes("pressed") && (
                    <div className="flex flex-col items-center gap-1.5">
                      <Button variant={variant} size={size} state="pressed">
                        버튼
                      </Button>
                      <span className="text-caption-12-regular text-content-secondary">
                        pressed
                      </span>
                    </div>
                  )}
                  {states.includes("disabled") && (
                    <div className="flex flex-col items-center gap-1.5">
                      <Button variant={variant} size={size} disabled>
                        버튼
                      </Button>
                      <span className="text-caption-12-regular text-content-secondary">
                        disabled
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}

        <div className="flex flex-col gap-3">
          <p className="text-body-14-semibold text-content-primary">outlined</p>
          <p className="text-caption-12-regular text-content-secondary">
            배경 surface/primary · 테두리 border/primary(1px) · 글자 content/secondary — Figma에
            normal 심볼만 있어서 pressed·disabled는 만들지 않았어요.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-col items-center gap-1.5">
              <Button variant="outlined" size="medium">
                버튼
              </Button>
              <span className="text-caption-12-regular text-content-secondary">
                medium (body-16-semibold)
              </span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <Button variant="outlined" size="small">
                버튼
              </Button>
              <span className="text-caption-12-regular text-content-secondary">
                small (body-14-medium — primary 계열 small의 semibold와 굵기가 달라요)
              </span>
            </div>
          </div>
        </div>
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
          <li>
            outlined 글자(content/secondary on 흰 배경)는 4.79:1로 본문 기준을 통과하지만, 테두리
            (border/primary)는 1.23:1이라 UI 컴포넌트 기준(3:1)에 많이 못 미쳐요. 흰 배경에서
            테두리가 거의 안 보이는 게 Figma 원본 그대로예요 — 임의로 진하게 바꾸지 않았습니다.
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
  description: "화면에서 가장 중요한 행동을 누르게 하는 버튼이에요. 4가지 위계 × 2가지 크기.",
  Component: ButtonStory,
};
