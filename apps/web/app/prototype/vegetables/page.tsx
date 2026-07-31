import { AppBar, PhoneFrame, Scroll } from "../_lib/shell";
import { GNB } from "../_components/gnb";
import { VegetablePriceList } from "../_components/vegetable-price-list";
import { getHomeData, getPriceMeta } from "../_lib/home-data";

// 시세는 하루 1회 갱신 → 1시간 단위 재검증(홈과 같은 기준선을 쓴다).
export const revalidate = 3600;

// F01-1 야채 시세 — GNB 탭 루트. 46종 전체를 검색·필터·정렬로 훑어보는 화면.
// 2026-07-31 홈 개편으로 신설 — 기존엔 이 목록이 홈(F01) 안에 있었는데, 홈이 여러 정보를 모아
// 보여주는 대시보드 역할로 바뀌면서 "모든 야채 시세 조회"라는 별도 목적을 전용 탭으로 분리했다.
// RSC 기본: 시세·등락 계산은 서버(getHomeData). 검색·필터·정렬만 클라 leaf(VegetablePriceList).
export default async function VegetablesPage() {
  const { items } = await getHomeData();
  const priceMeta = await getPriceMeta();

  return (
    <PhoneFrame>
      <AppBar title="야채 시세" />
      <Scroll>
        <VegetablePriceList items={items} priceMeta={priceMeta} />
      </Scroll>
      <GNB />
    </PhoneFrame>
  );
}
