import type { ComponentType } from "react";

export interface Story {
  /** 좌측 목차·앵커에 쓰는 고유 id (kebab-case) */
  id: string;
  title: string;
  /** Figma 출처 (node id·링크) — Figma에 없는 규격은 등록 금지 */
  figma: string;
  description: string;
  Component: ComponentType;
}
