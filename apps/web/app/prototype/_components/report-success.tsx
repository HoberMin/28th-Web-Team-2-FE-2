import Image from "next/image";
import Link from "next/link";
import { ActionButton } from "seed-design/ui/action-button";
import { BottomBar, PhoneFrame } from "../_lib/shell";

// F04 제보 성공 — 제보 폼 확인 직후 도달.
//
// 가게명을 알고 있으면 **같은 가게의 다음 품목**을 이어서 입력하는 경로를 준다.
// 왜 필요한가: 매장 축 화면(매장 탭·가게 상세)이 성립하려면 "한 가게 × 여러 품목" 제보가 있어야 한다.
// 품목 하나마다 제보 흐름을 처음부터 다시 타게 하면 가게마다 1~2건씩만 흩뿌려져
// "이 가게가 전반적으로 싼가"에 답할 수 없다. 가게명은 유지하고 품목만 갈아끼운다.
export function ReportSuccess({ item, place }: { item: string; place: string }) {
  const nextHref = item ? `/prototype/price/${item}` : "/prototype";
  const continueHref = `/prototype/report?place=${encodeURIComponent(place)}`;

  return (
    <PhoneFrame>
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
        <Image src="/veg/cart.svg" alt="" width={99} height={97} className="h-auto w-24" />
        <p className="text-head1-24 text-fg-neutral">제보 성공!</p>
        {place && (
          <p className="text-body-14-regular text-fg-neutral-muted">
            <strong className="font-semibold text-fg-neutral">{place}</strong>에서 본 다른 가격도
            <br />
            같이 남겨주시면 이웃에게 큰 도움이 돼요.
          </p>
        )}
      </div>

      <BottomBar>
        <div className="flex flex-col gap-2">
          {place && (
            <ActionButton asChild variant="brandSolid" size="large" className="w-full">
              <Link href={continueHref}>이 가게 가격 더 입력하기</Link>
            </ActionButton>
          )}
          <ActionButton asChild variant="neutralSolid" size="large" className="w-full">
            <Link href={nextHref}>확인</Link>
          </ActionButton>
        </div>
      </BottomBar>
    </PhoneFrame>
  );
}
