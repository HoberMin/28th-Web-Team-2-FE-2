import { ReportForm } from "../_components/report-form";
import type { Report } from "../_lib/types";

// F04-2 야채 제보 폼. searchParams는 서버에서 풀고 클라 폼에 전달.
// price·weight는 즉석 판단(F10)에서 이미 입력한 값 — 있으면 폼을 프리필해 재입력을 없앤다.
export default async function ReportPage({
  searchParams,
}: {
  searchParams: Promise<{
    item?: string;
    method?: string;
    place?: string;
    price?: string;
    weight?: string;
  }>;
}) {
  const { item, method, place, price, weight } = await searchParams;
  const reportMethod: Report["method"] = method === "photo" ? "photo" : "manual";
  return (
    <ReportForm
      item={item ?? ""}
      method={reportMethod}
      place={place ?? ""}
      prefillPrice={price ?? ""}
      prefillWeight={weight ?? ""}
    />
  );
}
