import { ReportForm } from "../_components/report-form";
import type { Report } from "../_lib/types";

// F04-2 야채 제보 폼. searchParams(item·method·place)는 서버에서 풀고 클라 폼에 전달.
export default async function ReportPage({
  searchParams,
}: {
  searchParams: Promise<{ item?: string; method?: string; place?: string }>;
}) {
  const { item, method, place } = await searchParams;
  const reportMethod: Report["method"] = method === "photo" ? "photo" : "manual";
  return <ReportForm item={item ?? ""} method={reportMethod} place={place ?? ""} />;
}
