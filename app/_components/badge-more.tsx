import { cn } from "../_lib/cn";

// Figma `badge/more` — Design Library node 185-1912, sync 2026-08-05.
// Variant 없음(단일 심볼). 야채 아이콘 줄 끝에서 "나머지 몇 개 더 있다"를 알리는 배지.
//
// Figma 구조: 48×48 슬롯 안에 36×36 원(common/black5)이 가운데 정렬되고,
// 그 안에 caption/12-bold + content/brand/medium 텍스트가 들어간다.
// 바깥 48×48은 야채 아이콘 격자 한 칸과 크기를 맞추려는 여백이라 그대로 유지했다.
//
// 이 컴포넌트는 에셋이 필요 없어(도형+텍스트뿐) 바로 옮길 수 있었다.

export interface BadgeMoreProps {
  /** 더 있는 항목 수. `+7`처럼 앞에 `+`가 붙어 렌더된다. */
  count: number;
  /** 스크린리더용 설명. 기본값은 "그 외 N개". */
  label?: string;
  className?: string;
}

export function BadgeMore({ count, label, className }: BadgeMoreProps) {
  return (
    <div className={cn("flex size-12 shrink-0 items-center justify-center", className)}>
      <span className="flex size-9 items-center justify-center rounded-full bg-black-5 text-caption-12-bold text-content-brand-medium">
        <span aria-hidden="true">+{count}</span>
        <span className="sr-only">{label ?? `그 외 ${count}개`}</span>
      </span>
    </div>
  );
}
