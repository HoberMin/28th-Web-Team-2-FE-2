import { ReportForm } from "../_components/report-form";
import type { Report } from "../_lib/types";

// F04 야채 제보. searchParams(item·method)는 서버에서 풀고 클라 폼에 전달.
export default async function ReportPage({
  searchParams,
}: {
  searchParams: Promise<{ item?: string; method?: string }>;
}) {
  const { item, method } = await searchParams;
  const reportMethod: Report["method"] = method === "photo" ? "photo" : "manual";
  return <ReportForm item={item ?? ""} method={reportMethod} />;
}
