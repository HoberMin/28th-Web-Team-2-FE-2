import Image from "next/image";
import Link from "next/link";
import { ActionButton } from "seed-design/ui/action-button";
import { BottomBar, PhoneFrame } from "../_lib/shell";

// F04 제보 성공 — 제보 폼 확인 직후 도달. 확인 → 해당 야채 시세로(없으면 홈).
// 정적 화면이라 서버 컴포넌트. 확인 버튼만 Link(ActionButton asChild).
export function ReportSuccess({ item }: { item: string }) {
  const nextHref = item ? `/prototype/price/${item}` : "/prototype";

  return (
    <PhoneFrame>
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4">
        <Image src="/veg/cart.svg" alt="" width={99} height={97} className="h-auto w-24" />
        <p className="text-head1-24 text-fg-neutral">제보 성공!</p>
      </div>

      <BottomBar>
        <ActionButton asChild variant="neutralSolid" size="large" className="w-full">
          <Link href={nextHref}>확인</Link>
        </ActionButton>
      </BottomBar>
    </PhoneFrame>
  );
}
