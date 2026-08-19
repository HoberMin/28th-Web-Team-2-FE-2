import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ROUTES } from "@/app/_lib/routes";
import { ReportCtaFooter } from "../_components/report-cta-footer";

// F04-4 제보 완료 — Design Library 1069:10328 (sync 2026-08-19).
//
// **Server Component다.** 인터랙션이 링크 2개뿐이라 클라이언트 지시어가 없다.
//
// get_design_context 실측:
//   헤더·GNB **없음** (Status Bar만 — iOS 목업이라 구현 대상 아님)
//   complete-body  y-[182.78px] · flex flex-col gap-[8px] items-center
//     제목       title/24-bold · content/primary  "야채 가격 제보 성공!"
//     설명       body/16-medium · content/secondary
//   image/cart   267×267 · top-[355.77px] (레포에 저장된 Figma cart 에셋 사용)
//   footer         y728 h116 · border-t border/secondary · px-[16px] pt-[8px] pb-[12px] · gap-[8px]
//     링크         px-[16px] py-[8px] · body/14-medium · **#262f3c(content/primary)** · **밑줄**
//     버튼         action-secondary/default · px-[28px] py-[12px] · radius/lg · w-full
//
// 문구와 버튼 이동은 기존 제보 플로우를 유지하고, 화면 배치·일러스트·배경만 새 시안에 맞춘다.

export const metadata: Metadata = {
  title: "제보 완료 | 장보고",
};

export default function ReportDonePage() {
  return (
    <main className="min-h-dvh bg-surface-secondary">
      <div
        className="relative mx-auto h-dvh w-full max-w-97.5 overflow-hidden bg-surface-primary"
        style={{
          backgroundImage:
            "linear-gradient(180deg, #fff 20%, #f7fff3 36.467%, #e8fbd5 60.099%, #dbfbb9 100%)",
        }}
      >
        <div className="absolute left-1/2 top-[182.78px] flex -translate-x-1/2 flex-col items-center gap-2 text-center">
          <h1 className="whitespace-nowrap text-title-24-bold text-content-primary">
            야채 가격 제보 성공!
          </h1>
          <p className="whitespace-nowrap text-body-16-medium text-content-secondary">
            3번 더 제보하면 제보 고수가 될 수 있어요
          </p>
        </div>

        <div
          className="absolute left-1/2 top-[355.77px] size-[267px] -translate-x-1/2"
          aria-hidden="true"
        >
          <div className="absolute left-[69px] top-[240px] h-[11px] w-[151px] rounded-full bg-green-400/30 blur-[1px]" />
          <Image
            src="/veg/cart.svg"
            alt=""
            width={236}
            height={237}
            priority
            unoptimized
            className="absolute left-[15px] top-[14px] size-[236px] rotate-[-4deg] object-contain"
          />
        </div>

        <Image
          src="/figma/design-library/images/grass-right.svg"
          alt=""
          width={80}
          height={30}
          unoptimized
          className="absolute left-[calc(75%+22px)] top-[598px] h-[33px] w-[95px]"
        />
        <Image
          src="/figma/design-library/images/grass-left.svg"
          alt=""
          width={81}
          height={30}
          unoptimized
          className="absolute left-[-12px] top-[627px] h-[33px] w-[81px]"
        />

        <ReportCtaFooter
          className="absolute bottom-0 left-1/2 -translate-x-1/2 !bg-transparent"
          above={
            <Link
              href={ROUTES.report}
              className="flex items-center justify-center px-4 py-2 text-body-14-medium text-content-primary underline"
            >
              이 가게에서 더 제보하기
            </Link>
          }
        >
          <Link
            href={ROUTES.prices}
            className="relative inline-flex w-full items-center justify-center rounded-lg bg-action-secondary-default px-7 py-3 text-body-16-semibold text-content-inverse active:bg-content-secondary"
          >
            확인
          </Link>
        </ReportCtaFooter>
      </div>
    </main>
  );
}
