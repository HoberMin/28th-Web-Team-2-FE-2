"use client";

import IconLocationpinFill from "@karrotmarket/react-monochrome-icon/IconLocationpinFill";
import { useCurrentDistrict } from "../_lib/location";

// GPS 기반 현재 자치구 표시 (홈·시세 상단). 측위 중엔 안내.
export function LocationLabel() {
  const { district, loading } = useCurrentDistrict();
  return (
    <div className="flex items-center gap-1 text-fg-neutral">
      <span className="text-fg-brand [&_svg]:size-6" aria-hidden="true">
        <IconLocationpinFill />
      </span>
      <span className="text-head2-16">{loading ? "위치 확인 중…" : district}</span>
    </div>
  );
}
