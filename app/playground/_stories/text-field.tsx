import { TextField } from "../../_components/text-field";
import { FigmaIcon } from "@/app/_lib/figma-asset";
import type { Story } from "./types";

// Figma `field/text` node 237-8556, sync 2026-08-05 → **재sync 2026-08-06**: Property 1에
// focused가 추가돼 normal | typing | focused 3종.
//
// 2026-08-07: 플레이그라운드가 외부 배포용이라는 이유로 토큰명·px 스펙·대비 수치 같은 내부용
// 문구를 전부 걷어냈다(디자이너 요청). 그런 정보(대비 수치, focus 테두리 조사 경위 등)가 다시
// 필요하면 이 파일의 git 이력을 참고한다 — 화면엔 다시 노출하지 않는다.

function TextFieldStory() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <p className="text-body-14-semibold text-content-primary">normal (비어 있을 때)</p>
          <TextField
            placeholder="찾는 야채 있으신가요?"
            aria-label="야채 검색"
            trailing={<FigmaIcon name="search" width={24} />}
          />
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-body-14-semibold text-content-primary">typing (값이 있을 때)</p>
          <TextField
            defaultValue="당근당근"
            aria-label="야채 검색"
            trailing={<FigmaIcon name="close-fill" width={24} />}
          />
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-body-14-semibold text-content-primary">focused (눌렀을 때)</p>
          <p className="text-caption-12-regular text-content-secondary">
            아래 칸을 탭 또는 클릭해서 포커스 링을 확인하세요.
          </p>
          <TextField
            placeholder="찾는 야채 있으신가요?"
            aria-label="야채 검색 (포커스 확인용)"
            trailing={<FigmaIcon name="search" width={24} />}
          />
        </div>
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
