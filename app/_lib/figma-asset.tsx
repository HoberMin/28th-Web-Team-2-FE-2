import Image from "next/image";

// Figma 에셋(`public/figma/design-library/`) 경로 래퍼.
//
// ⚠️ 이건 **Figma 규격 컴포넌트가 아니라 인프라 래퍼**다. 그래서 `app/_components/`가 아니라
//    여기 있고, `/playground` 스토리도 만들지 않는다(design-guide §1-1의 "규격 1개 = 스토리
//    1개"는 규격에 적용되는 규칙이다). `_lib`의 유일한 .tsx인 이유가 이것이다.
//
// 아이콘 색 규칙 — 자리마다 둘 중 하나를 골라야 한다:
//   · `currentColor` ○ : 문맥에 따라 색이 변해야 하는 자리(활성/비활성, 눌림 등).
//                        마스크로 그리므로 **원본 SVG의 색·그림자·다색 구성이 전부 사라진다.**
//   · `currentColor` ✗ : 원본 색이 곧 시안 색인 자리. 다색 아이콘(흰 테두리 하트),
//                        그림자가 박힌 아이콘, 배경 위에서만 성립하는 흰 글리프가 여기 속한다.

const DESIGN_LIBRARY_ROOT = "/figma/design-library";

interface FigmaIconProps {
  name: string;
  width: number;
  height?: number;
  className?: string;
  currentColor?: boolean;
}

export function FigmaIcon({
  name,
  width,
  height = width,
  className,
  currentColor = false,
}: FigmaIconProps) {
  const src = `${DESIGN_LIBRARY_ROOT}/icons/${name}.svg`;

  if (currentColor) {
    return (
      <span
        aria-hidden="true"
        className={`inline-block shrink-0 bg-current ${className ?? ""}`}
        style={{
          width,
          height,
          WebkitMaskImage: `url("${src}")`,
          maskImage: `url("${src}")`,
          WebkitMaskPosition: "center",
          maskPosition: "center",
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskSize: "contain",
          maskSize: "contain",
        }}
      />
    );
  }

  return (
    <Image
      src={src}
      alt=""
      width={width}
      height={height}
      // SVG는 next/image 최적화 파이프라인이 `dangerouslyAllowSVG` 없이는 처리하지 못한다.
      unoptimized
      className={className}
      aria-hidden="true"
    />
  );
}

interface FigmaImageProps {
  name: string;
  alt?: string;
  width: number;
  height: number;
  className?: string;
}

export function FigmaImage({
  name,
  alt = "",
  width,
  height,
  className,
}: FigmaImageProps) {
  // 래스터(png)는 표시 크기가 원본보다 작은 경우가 많아 최적화를 켠다 — 이 헬퍼가
  // `/playground` 전용이던 동안엔 무해했지만 실화면으로 승격되면서 전송량이 그대로 쌓인다.
  // SVG만 최적화를 끈다(위 FigmaIcon과 같은 이유).
  const isSvg = name.endsWith(".svg");

  return (
    <Image
      src={`${DESIGN_LIBRARY_ROOT}/images/${name}`}
      alt={alt}
      width={width}
      height={height}
      unoptimized={isSvg}
      className={className}
    />
  );
}
