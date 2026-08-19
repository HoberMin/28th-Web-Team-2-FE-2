import Image from "next/image";
import { VEGETABLES } from "../../_lib/vegetables";
import { getVegetableVectorImageById } from "../../_lib/vegetable-images";

const VEGETABLE_BY_NAME = new Map(VEGETABLES.map((vegetable) => [vegetable.name, vegetable]));

interface HomeVegetableImageProps {
  name: string;
  size: 40 | 48;
}

/**
 * 홈 채소 슬롯은 Figma에서 받은 10종 SVG만 사용한다.
 * 에셋이 없는 품목은 형태가 가까운 벡터를 재사용하고 실물 사진으로 대체하지 않는다.
 */
export function HomeVegetableImage({ name, size }: HomeVegetableImageProps) {
  const vegetable = VEGETABLE_BY_NAME.get(name);
  const src = vegetable
    ? getVegetableVectorImageById(vegetable.id)
    : getVegetableVectorImageById("onion");

  return (
    <Image
      src={src}
      alt={`${name} 이미지`}
      width={size}
      height={size}
      unoptimized={src.endsWith(".svg")}
      className="size-full object-contain"
    />
  );
}
