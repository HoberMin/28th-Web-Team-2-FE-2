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

export interface ImageProfileReporterProps {
  color?: ReporterTone;
  className?: string;
}

export function ImageProfileReporter({ color = "green", className }: ImageProfileReporterProps) {
  return (
    <span aria-hidden="true" className={cn("relative block size-11 shrink-0 overflow-hidden", className)}>
      <Image src={PROFILE_ASSET[color]} alt="" fill unoptimized sizes="44px" />
    </span>
  );
}
