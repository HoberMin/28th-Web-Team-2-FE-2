import type { ComponentType } from "react";

/** 목차 그룹 — 새 그룹이 필요하면 여기에 추가 (design-guide.md §1-1) */
export type StoryGroup = "파운데이션" | "컴포넌트" | "패턴";

export interface Story {
  /** 좌측 목차·앵커에 쓰는 고유 id (kebab-case) */
  id: string;
  title: string;
  /** 목차에서 묶이는 그룹 — 토큰류=파운데이션, UI 부품=컴포넌트, 조합 규칙=패턴 */
  group: StoryGroup;
  /** Figma 출처 (node id·링크) — Figma에 없는 규격은 등록 금지 */
  figma: string;
  description: string;
  Component: ComponentType;
}
