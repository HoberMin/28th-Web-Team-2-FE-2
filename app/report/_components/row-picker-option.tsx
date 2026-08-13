import Link from "next/link";
import { cn } from "@/app/_lib/cn";
import { FigmaIcon } from "@/app/_lib/figma-asset";

// Figma가 `row/sort-option`이라고 부르는 행의 **chevron 변형** — 화면GUI(원본) 364:8068 계열,
// sync 2026-08-13. F04-2 야채 카테고리 목록(카테고리 8행 / 야채 11행)이 쓴다.
//
// get_design_context 실측(364:8068):
//   bg surface/primary · border-b border/secondary · flex items-center justify-between · py-[16px]
//   라벨    body/16-medium · content/primary
//   우측    icon/chevron-right **20**
//   → 높이 hug: 16 + 25 + 16 + 테두리 1 = **58px** (XML 실측과 일치)
//
// ⚠️ **레포 `app/_components/row-sort-option.tsx`를 재사용하지 않았다.** 박스(py-4 + border-b
//    border/secondary)는 정확히 같지만, 그 컴포넌트의 우측 슬롯은 `selected`일 때만 나타나는
//    20px **체크** 아이콘이다. 여기 필요한 건 항상 보이는 **chevron-right**(다음 화면으로 이동)라
//    의미가 다르다. 공통 컴포넌트에 trailing 슬롯을 뚫는 건 컴포넌트 규격 변경이라
//    이번 작업 범위 밖이다(별도 세션) — 그래서 화면 로컬로 뒀다.
//
// ⚠️ Figma가 **세 가지 서로 다른 행을 모두 `row/sort-option`이라고 부른다**:
//      온보딩 지역 선택   py-[12px] · 테두리 없음 · 선택 시 체크        → h 49
//      정렬 시트         py-[16px] · border-b     · 선택 시 체크        → h 57
//      제보 카테고리      py-[16px] · border-b     · 항상 chevron-right → h 58
//    같은 이름이 세 규격을 덮고 있다(GUI피드백.md에 기록 — 이름을 나눠야 닫히는 항목).
//
// 대비: 라벨 content/primary 13.51:1 → 통과. 행 높이 58로 터치 타겟 44 기준 통과.

export interface RowPickerOptionProps {
  /** 행 라벨. 예: "뿌리채소", "오이" */
  label: string;
  /** 이 행을 골랐을 때 갈 곳. */
  href: string;
  className?: string;
}

export function RowPickerOption({ label, href, className }: RowPickerOptionProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex w-full items-center justify-between border-b border-border-secondary bg-surface-primary py-4 text-body-16-medium text-content-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-content-primary",
        className,
      )}
    >
      <span className="min-w-0 truncate">{label}</span>
      <FigmaIcon name="chevron-right" width={20} className="shrink-0" />
    </Link>
  );
}
