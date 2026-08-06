import { Button, type ButtonSize, type ColorVariant } from "../../_components/button";
import type { Story } from "./types";

// Figma `button/cta_md` node 160-2855, sync 2026-08-05 → **재sync 2026-08-06**.
// 프레임 심볼은 정확히 14개다: medium은 색상 3종 × state 3종(normal·pressed·disabled)=9개,
// small은 색상 3종 × normal만=3개, outlined는 medium·small 각 normal만=2개. 나열도 이 14개만
// 그대로 보여준다 — small의 pressed·disabled는 Figma 원본이 없어서 만들지 않았다
// (2026-08-06 리뷰에서 없는 조합 6개를 만들어 보여주고 있던 걸 발견해 제거함 — design-guide
// §1-1 "Figma에 있는 규격만 등록한다" 위반이었다).
//
// 2026-08-07: 플레이그라운드가 외부 배포용이라는 이유로 토큰명·px 스펙·대비 수치 같은 내부용
// 문구를 전부 걷어냈다(디자이너 요청). 그런 정보가 다시 필요하면 이 파일의 git 이력이나
// Figma 노드를 참고한다 — 화면엔 다시 노출하지 않는다.

const COLOR_VARIANTS: ColorVariant[] = ["primary", "secondary", "tertiary"];

// Figma에 실제로 있는 state만 size별로 다르다 — medium은 3종, small은 normal만.
const SIZES: { size: ButtonSize; states: ("normal" | "pressed" | "disabled")[] }[] = [
  { size: "medium", states: ["normal", "pressed", "disabled"] },
  { size: "small", states: ["normal"] },
];

function ButtonStory() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-6">
        {COLOR_VARIANTS.map((variant) => (
          <div key={variant} className="flex flex-col gap-3">
            <p className="text-body-14-semibold text-content-primary">{variant}</p>
            {SIZES.map(({ size, states }) => (
              <div key={size} className="flex flex-col gap-2">
                <p className="text-caption-12-semibold text-content-secondary">{size}</p>
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
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-col items-center gap-1.5">
              <Button variant="outlined" size="medium">
                버튼
              </Button>
              <span className="text-caption-12-regular text-content-secondary">medium</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <Button variant="outlined" size="small">
                버튼
              </Button>
              <span className="text-caption-12-regular text-content-secondary">small</span>
            </div>
          </div>
        </div>
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
