import { Button, type ButtonSize, type ColorVariant } from "../../_components/button";
import type { Story } from "./types";

// Figma `button/cta_md` node 160-2855, sync 2026-08-05 → 재sync 2026-08-06 → **재sync 2026-08-08**.
// 프레임 심볼은 이제 28개다: primary·secondary·tertiary가 각각 state 4종
// (normal·pressed·disabled·loading) × size 2종 = 24개, outlined는 state 2종
// (normal·loading) × size 2종 = 4개.
//
// 2026-08-06 sync 때는 small에 normal 심볼밖에 없어서 목록을 그렇게 좁혀 뒀었는데,
// 이번에 다시 읽어 보니 small에도 pressed·disabled·loading이 생겼다. 그래서 두 size가
// 같은 state 목록을 쓰도록 넓혔다 — 여전히 Figma에 실재하는 조합만 나열한다
// (design-guide §1-1 "Figma에 있는 규격만 등록한다").
//
// 2026-08-07: 플레이그라운드가 외부 배포용이라는 이유로 토큰명·px 스펙·대비 수치 같은 내부용
// 문구를 전부 걷어냈다(디자이너 요청). 그런 정보가 다시 필요하면 이 파일의 git 이력이나
// Figma 노드를 참고한다 — 화면엔 다시 노출하지 않는다.

const COLOR_VARIANTS: ColorVariant[] = ["primary", "secondary", "tertiary"];
const SIZES: ButtonSize[] = ["medium", "small"];

function ButtonStory() {
  return (
    <div className="flex flex-col gap-6">
      {COLOR_VARIANTS.map((variant) => (
        <div key={variant} className="flex flex-col gap-3">
          <p className="text-body-14-semibold text-content-primary">{variant}</p>
          {SIZES.map((size) => (
            <div key={size} className="flex flex-col gap-2">
              <p className="text-caption-12-semibold text-content-secondary">{size}</p>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex flex-col items-center gap-1.5">
                  <Button variant={variant} size={size}>
                    버튼
                  </Button>
                  <span className="text-caption-12-regular text-content-secondary">normal</span>
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <Button variant={variant} size={size} state="pressed">
                    버튼
                  </Button>
                  <span className="text-caption-12-regular text-content-secondary">pressed</span>
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <Button variant={variant} size={size} disabled>
                    버튼
                  </Button>
                  <span className="text-caption-12-regular text-content-secondary">disabled</span>
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <Button variant={variant} size={size} state="loading">
                    버튼
                  </Button>
                  <span className="text-caption-12-regular text-content-secondary">loading</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}

      <div className="flex flex-col gap-3">
        <p className="text-body-14-semibold text-content-primary">outlined</p>
        {SIZES.map((size) => (
          <div key={size} className="flex flex-col gap-2">
            <p className="text-caption-12-semibold text-content-secondary">{size}</p>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex flex-col items-center gap-1.5">
                <Button variant="outlined" size={size}>
                  버튼
                </Button>
                <span className="text-caption-12-regular text-content-secondary">normal</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <Button variant="outlined" size={size} state="loading">
                  버튼
                </Button>
                <span className="text-caption-12-regular text-content-secondary">loading</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-body-14-semibold text-content-primary">기다리는 중일 때</p>
        <p className="text-caption-12-regular text-content-secondary">
          글자는 자리를 그대로 지키면서 잠깐 숨고, 그 위에 동그란 표시가 돕니다. 그래서 버튼 크기가
          바뀌지 않아요. 이때는 눌러도 반응하지 않습니다.
        </p>
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
