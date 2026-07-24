import { ReportSuccess } from "../../_components/report-success";

// F04 제보 성공. 제보 폼에서 넘어온 item(야채 id)을 서버에서 풀어 확인 버튼 목적지로 전달.
export default async function ReportSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ item?: string }>;
}) {
  const { item } = await searchParams;
  return <ReportSuccess item={item ?? ""} />;
}
