import { ReportLocation } from "../../_components/report-location";

// F04-1 가게 위치 선택. searchParams(item·method)는 서버에서 풀고 클라 뷰에 전달.
export default async function ReportLocationPage({
  searchParams,
}: {
  searchParams: Promise<{ item?: string; method?: string }>;
}) {
  const { item, method } = await searchParams;
  return <ReportLocation item={item ?? ""} method={method === "photo" ? "photo" : "manual"} />;
}
