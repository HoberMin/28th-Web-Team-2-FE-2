"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import IconXmarkLine from "@karrotmarket/react-monochrome-icon/IconXmarkLine";
import { PhoneFrame, StatusBar } from "../_lib/shell";

// F02 야채 촬영 — 프로토타입이라 실제 카메라 대신 목업. 셔터 → 제보 폼(촬영 경로).
export function CaptureView({ item }: { item: string }) {
  const router = useRouter();
  const closeHref = item ? `/prototype/price/${item}` : "/prototype";
  const query = new URLSearchParams({ method: "photo", ...(item ? { item } : {}) });

  return (
    <PhoneFrame>
      <div className="absolute inset-0 flex flex-col bg-neutral-900 text-white">
        <StatusBar dark />
        <div className="relative flex h-14 shrink-0 items-center justify-center">
          <Link
            href={closeHref}
            aria-label="촬영 닫기"
            className="absolute left-2 flex size-12 items-center justify-center rounded-full hover:bg-white/10 [&_svg]:size-6"
          >
            <IconXmarkLine />
          </Link>
          <h1 className="text-head2-18">야채 촬영</h1>
        </div>

        {/* 뷰파인더 목업 — 촬영 프레이밍 가이드 */}
        <div className="flex flex-1 items-center justify-center px-8">
          <div className="relative aspect-square w-full max-w-[280px]">
            <span className="absolute -top-px -left-px size-8 rounded-tl-lg border-t-2 border-l-2 border-white/80" />
            <span className="absolute -top-px -right-px size-8 rounded-tr-lg border-t-2 border-r-2 border-white/80" />
            <span className="absolute -bottom-px -left-px size-8 rounded-bl-lg border-b-2 border-l-2 border-white/80" />
            <span className="absolute -right-px -bottom-px size-8 rounded-br-lg border-r-2 border-b-2 border-white/80" />
            <span className="absolute inset-0 flex items-center justify-center text-6xl opacity-30" aria-hidden="true">
              🥔
            </span>
          </div>
        </div>

        {/* 안내 + 셔터 */}
        <div className="flex shrink-0 flex-col items-center gap-6 pb-10">
          <p className="text-body-14-regular text-white/80">가격과 야채가 잘 보이게 촬영해 주세요</p>
          <button
            type="button"
            aria-label="촬영"
            onClick={() => router.push(`/prototype/report?${query.toString()}`)}
            className="flex size-[74px] items-center justify-center rounded-full border-4 border-white/40 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            <span className="size-[58px] rounded-full bg-white transition-transform active:scale-90" />
          </button>
        </div>
      </div>
    </PhoneFrame>
  );
}
