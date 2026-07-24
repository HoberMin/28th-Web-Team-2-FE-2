import { CaptureView } from "../_components/capture-view";

// F02 야채 촬영. searchParams(item)는 서버에서 풀고 클라 뷰에 전달.
export default async function CapturePage({
  searchParams,
}: {
  searchParams: Promise<{ item?: string }>;
}) {
  const { item } = await searchParams;
  return <CaptureView item={item ?? ""} />;
}
