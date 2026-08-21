import Image from "next/image";
import { cn } from "../_lib/cn";

// Figma `image-profile` — Design Library node 671:9932, sync 2026-08-11.
// color 4종 심볼을 MCP로 각각 2배(88×88) PNG export하고 44×44로 표시한다.
export type ReporterTone = "green" | "orange" | "gray" | "blue";

const PROFILE_ASSET: Record<ReporterTone, string> = {
  green: "/figma/design-library/images/profile-reporter-green.png",
  orange: "/figma/design-library/images/profile-reporter-orange.png",
  gray: "/figma/design-library/images/profile-reporter-gray.png",
  blue: "/figma/design-library/images/profile-reporter-blue.png",
};

/**
 * 표시 크기. Figma가 두 자리에서 다른 크기로 쓴다:
 *   44 — `avatar/reporter`(댓글 `item/comment`)
 *   24 — `row/saved type=photo`의 제보자 줄 (F03 가게상세, node 1096:19281)
 *
 * `className`으로 덮지 않고 prop으로 받는다 — `cn`은 tailwind-merge가 아니라 단순 join이라
 * `size-11`과 `size-6`이 한 요소에 같이 붙으면 승자를 클래스 순서가 정하지 않는다.
 */
export type ImageProfileReporterSize = 44 | 24;

const SIZE_CLASS: Record<ImageProfileReporterSize, string> = {
  44: "size-11",
  24: "size-6",
};

export interface ImageProfileReporterProps {
  color?: ReporterTone;
  size?: ImageProfileReporterSize;
  className?: string;
}

export function ImageProfileReporter({
  color = "green",
  size = 44,
  className,
}: ImageProfileReporterProps) {
  return (
    <span
      aria-hidden="true"
      className={cn("relative block shrink-0 overflow-hidden", SIZE_CLASS[size], className)}
    >
      <Image src={PROFILE_ASSET[color]} alt="" fill unoptimized sizes={`${size}px`} />
    </span>
  );
}
