import { ReportSuccess } from "../../_components/report-success";

// F04 제보 성공. 제보 폼에서 넘어온 item(야채 id)·place(가게명)를 서버에서 풀어 다음 행동에 전달.
export default async function ReportSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ item?: string; place?: string }>;
}) {
  const { item, place } = await searchParams;
  return <ReportSuccess item={item ?? ""} place={place ?? ""} />;
}
