import Link from "next/link";
import { ActionButton } from "seed-design/ui/action-button";

// 제보하기 CTA — 시세 상세(F03) 하단 고정 버튼. 누르면 바로 제보 폼(F04-2)으로 간다.
//
// 2026-08-04: 「어떻게 제보할까요?」 바텀시트(촬영 / 직접 입력)를 없앴다. 어느 쪽을 골라도
// 도착지는 같은 폼이었고, 사진은 이제 그 폼 안의 선택 입력이다(넣으면 값이 채워진다).
// 갈림길이 한 단계를 늘리기만 했다 → 시트를 지우고 폼으로 직행한다.
// 시트가 사라져 상태가 없어졌으므로 클라 컴포넌트일 이유도 없다(서버 렌더).
export function ReportSheet({ vegetableId }: { vegetableId: string }) {
  return (
    <ActionButton asChild variant="neutralSolid" size="large" className="w-full">
      <Link href={`/prototype/report?item=${vegetableId}`}>오프라인 가격 제보하기</Link>
    </ActionButton>
  );
}
