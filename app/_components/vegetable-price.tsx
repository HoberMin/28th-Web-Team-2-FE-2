import { cn } from "../_lib/cn";

// Figma `grid/vegetable-price` — Design Library node 224-7408, sync 2026-08-05.
// price(14pt | 16pt) × lines(1 line | 2 lines) = 4종.
//
// 값(굵게) + 단위(연하게) 조합. lines는 둘을 가로로 붙일지(1 line) 세로로 쌓을지(2 lines)를 정한다.
//   1 line  → 가로 배치. 값이 길면 72px에서 말줄임(Figma가 max-w 72 + ellipsis로 잡아 둔 값).
//   2 lines → 세로 배치. 값이 길면 줄바꿈된다.
// 부모 그리드 칸 너비(Figma 111.333px)는 레이아웃 맥락이라 컴포넌트에 넣지 않았다 — w-full로 따라간다.

export type VegetablePriceSize = "14" | "16";
export type VegetablePriceLines = 1 | 2;

const VALUE_SIZE: Record<VegetablePriceSize, string> = {
  "14": "text-body-14-bold",
  "16": "text-body-16-bold",
};

export interface VegetablePriceProps {
  /** 표시할 가격 문자열 (포맷팅은 호출자 책임). 예: "24,900원" */
  value: string;
  /** 단위. 예: "/100kg". 환산 가격처럼 숨겨야 할 때는 생략한다. */
  unit?: string;
  size?: VegetablePriceSize;
  lines?: VegetablePriceLines;
  className?: string;
}

export function VegetablePrice({
  value,
  unit,
  size = "14",
  lines = 2,
  className,
}: VegetablePriceProps) {
  const oneLine = lines === 1;

  return (
    <div
      className={cn(
        "flex w-full",
        oneLine ? "items-center gap-1 whitespace-nowrap" : "flex-col items-start justify-center",
        className,
      )}
    >
      <p
        className={cn(
          VALUE_SIZE[size],
          "text-content-primary",
          oneLine ? "max-w-18 truncate" : "min-w-full",
        )}
      >
        {value}
      </p>
      {unit ? (
        <p
          className={cn(
            "max-w-9 text-caption-12-regular text-content-disabled",
            oneLine ? null : "whitespace-nowrap",
          )}
        >
          {unit}
        </p>
      ) : null}
    </div>
  );
}
