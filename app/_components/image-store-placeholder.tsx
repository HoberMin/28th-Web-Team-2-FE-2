import Image from "next/image";
import { cn } from "../_lib/cn";

// Figma `image/store-placeholder` — Design Library node 703:13594, sync 2026-08-11.
// 가게·말풍선 벡터와 안내 문구가 합쳐진 390×220 원본 export다.
export interface ImageStorePlaceholderProps {
  className?: string;
}

export function ImageStorePlaceholder({ className }: ImageStorePlaceholderProps) {
  return (
    <span className={cn("relative block h-55 w-full overflow-hidden", className)}>
      <Image
        src="/figma/design-library/images/store-placeholder.png"
        alt="가게 사진을 준비 중이에요"
        fill
        unoptimized
        sizes="390px"
        className="object-cover"
      />
    </span>
  );
}
