import { ErrandList } from "../_components/errand-list";
import { getPriceMap } from "../_lib/home-data";

export const revalidate = 3600;

// F12 심부름 목록 — 장보기를 부탁받은 사람이 보는 화면.
// 목록과 "이 가격까지는 사도 된다"는 상한만 보여준다(시세 그래프·제보 같은 건 필요 없다).
export default async function ErrandPage({
  searchParams,
}: {
  searchParams: Promise<{ list?: string }>;
}) {
  const { list } = await searchParams;
  const priceMap = await getPriceMap();
  return <ErrandList raw={list ?? ""} priceMap={priceMap} />;
}
