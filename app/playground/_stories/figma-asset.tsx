import Image from "next/image";

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
  return (
    <Image
      src={`${DESIGN_LIBRARY_ROOT}/images/${name}`}
      alt={alt}
      width={width}
      height={height}
      unoptimized
      className={className}
    />
  );
}
