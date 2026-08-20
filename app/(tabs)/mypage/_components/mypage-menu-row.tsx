import Link from "next/link";
import { FigmaIcon } from "@/app/_lib/figma-asset";

// F05 리스트 메뉴 한 줄.
//
// **Figma에 F05 시안이 없다**(`shared/pages.md` §시안 없음). 새 규격을 지어내지 않기 위해
// 치수를 통째로 `row/sort-option`의 `state=normal`(318-14814)에서 빌려 왔다 —
// py-16 · border-b border/secondary · body/16-medium. 그 컴포넌트 자체를 쓰지 않는 이유는
// 그건 선택 토글 <button>이고(aria-pressed) 여기는 다음 화면으로 가는 링크라서다.
//
// 시안이 오면 이 파일을 교체한다. 여기 있는 여백·타이포는 규격이 아니라 차용값이다.

export interface MyPageMenuRowProps {
  href: string;
  label: string;
  /** 우측 보조 문구. 예: "3곳" / "없음" */
  value: string;
}

export function MyPageMenuRow({ href, label, value }: MyPageMenuRowProps) {
  return (
    <Link
      href={href}
      className="flex min-h-14.5 w-full items-center justify-between gap-2 border-b border-border-secondary py-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-content-primary"
    >
      <span className="min-w-0 truncate text-body-16-medium text-content-primary">{label}</span>
      <span className="flex shrink-0 items-center gap-1">
        <span className="text-body-14-medium text-content-secondary">{value}</span>
        <FigmaIcon name="chevron-right" width={12} />
      </span>
    </Link>
  );
}
