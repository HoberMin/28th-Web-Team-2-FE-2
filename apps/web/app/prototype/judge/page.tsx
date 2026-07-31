import { QuickJudge } from "../_components/quick-judge";
import { getHomeData, getTodayIso } from "../_lib/home-data";

// 시세는 하루 1회 갱신 → 1시간 단위 재검증(홈과 같은 조립 결과를 재사용).
export const revalidate = 3600;

// F10 즉석 판단 — 가격만 입력하면 우리 동네 기준으로 사도 되는지 판정한다.
// searchParams(item)로 특정 품목을 미리 선택한 상태로 들어올 수 있다(시세 화면에서 진입).
export default async function JudgePage({
  searchParams,
}: {
  searchParams: Promise<{ item?: string }>;
}) {
  const { item } = await searchParams;
  const { items } = await getHomeData();
  return <QuickJudge items={items} initialItemId={item ?? ""} todayIso={getTodayIso()} />;
}
