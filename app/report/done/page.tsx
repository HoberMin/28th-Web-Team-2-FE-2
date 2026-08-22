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
//   image/cart   267×267 · top-[355.77px] — Figma `image/cart`(1084:10826) export를
//                `public/cart.png`(802×802 = 3배)로 받아 그대로 쓴다.
//                이전에는 `public/veg/cart.svg`(99×97 안에 비트맵을 물린 프로토타입 시절 에셋)를
//                236px로 늘려 그려 흐릿했다 — QA-V3 #5 "image/cart 반영 안됨"이 이것이다.
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
      {/*
        QA-V3 #5 화면 해상도 대응 (디자이너 지시):
          "가운데 오토레이아웃 영역 **외**의 영역이 먼저 축소/확대되고,
           그게 다 줄어들면 image/cart가 **최소너비 240**까지 축소된다"
        → 절대 좌표(top-[182.78px] 등)를 걷어내고 세로 흐름 + 신축 여백으로 바꿨다.
          여백 3개가 Figma 간격 비율(139 : 105 : 105)대로 먼저 줄고, 다 줄면 카트가 240까지 줄어든다.
          장식 풀 그림만 절대 배치로 남긴다(푸터 기준 오프셋).
      */}
      <div
        className="relative mx-auto flex h-dvh w-full max-w-97.5 flex-col overflow-hidden bg-surface-primary"
        style={{
          backgroundImage:
            "linear-gradient(180deg, #fff 20%, #f7fff3 36.467%, #e8fbd5 60.099%, #dbfbb9 100%)",
        }}
      >
        {/* Figma 상단 여백 182.78 − Status Bar 44 = 139 */}
        <div aria-hidden="true" className="min-h-0 flex-[139]" />

        <div className="flex shrink-0 flex-col items-center gap-2 px-4 text-center">
          <h1 className="whitespace-nowrap text-title-24-bold text-content-primary">
            야채 가격 제보 성공!
          </h1>
          <p className="whitespace-nowrap text-body-16-medium text-content-secondary">
            3번 더 제보하면 제보 고수가 될 수 있어요
          </p>
        </div>

        {/* Figma 간격: 텍스트 하단 250.78 → 카트 상단 355.77 = 105 */}
        <div aria-hidden="true" className="min-h-0 flex-[105]" />

        {/*
          카트는 여백이 다 줄어든 뒤에만 줄어든다(`shrink` + `min-w-60`/`min-h-60` = 240 하한).
          정사각이라 폭·높이 하한을 같이 걸어야 세로가 좁은 화면에서도 비율이 안 깨진다.
        */}
        <div className="mx-auto flex min-h-60 w-[267px] min-w-60 max-w-full shrink items-center justify-center">
          <Image
            src="/cart.png"
            alt=""
            width={802}
            height={802}
            priority
            className="size-full object-contain"
          />
        </div>

        {/* Figma 간격: 카트 하단 623.02 → 푸터 상단 728 = 105 */}
        <div aria-hidden="true" className="min-h-0 flex-[105]" />

        {/*
          풀 그림은 Figma에서 카트 옆 배경 장식이라 흐름에서 빼고 푸터(116) 기준으로 띄운다.
          grass-right 하단 631.5 → 푸터까지 96.5 → bottom 212.5, grass-left 하단 659.95 → bottom 184.
        */}
        <Image
          src="/figma/design-library/images/grass-right.svg"
          alt=""
          width={80}
          height={30}
          unoptimized
          className="absolute bottom-[212px] left-[calc(75%+22px)] h-[33px] w-[95px]"
        />
        <Image
          src="/figma/design-library/images/grass-left.svg"
          alt=""
          width={81}
          height={30}
          unoptimized
          className="absolute bottom-[184px] left-[-12px] h-[33px] w-[81px]"
        />

        <ReportCtaFooter
          className="shrink-0 !bg-transparent"
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
