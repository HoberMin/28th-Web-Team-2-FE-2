import { ReporterProfile } from "../../_components/reporter-profile";
import { getTodayIso } from "../../_lib/home-data";

export const revalidate = 3600;

// F06-1 공개 제보 목록 — 제보왕(F06)에서 사람을 누르면 들어오는 화면.
// 순위·제보 목록은 클라 제보 스토어(localStorage)에서 만든다. 서버는 "오늘" 기준일만 내려준다
// (제보 시점 계산이 기기 시계에 흔들리지 않게 — home-data.ts와 동일한 이유).
/** 잘못된 퍼센트 인코딩(`%zz` 등)이 URL에 오면 decodeURIComponent가 throw — 화면을 죽이는 대신
 * 원문 그대로 두면 일치하는 제보왕이 없어 "찾을 수 없어요" 빈 상태로 자연스럽게 떨어진다. */
function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export default async function ReporterPage({ params }: { params: Promise<{ nickname: string }> }) {
  const { nickname } = await params;
  return <ReporterProfile nickname={safeDecode(nickname)} todayIso={getTodayIso()} />;
}
