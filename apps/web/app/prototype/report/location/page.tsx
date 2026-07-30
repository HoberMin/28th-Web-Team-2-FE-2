import { ReportLocation } from "../../_components/report-location";

// F04-1 가게 위치 선택. searchParams는 서버에서 풀고 클라 뷰에 전달.
// price·weight는 즉석 판단(F10)에서 이미 입력한 값을 제보 폼까지 실어 보내는 통로다
// (판단하려고 이미 가격을 넣었으니 제보에서 다시 묻지 않는다).
export default async function ReportLocationPage({
  searchParams,
}: {
  searchParams: Promise<{ item?: string; method?: string; price?: string; weight?: string }>;
}) {
  const { item, method, price, weight } = await searchParams;
  return (
    <ReportLocation
      item={item ?? ""}
      method={method === "photo" ? "photo" : "manual"}
      price={price ?? ""}
      weight={weight ?? ""}
    />
  );
}
