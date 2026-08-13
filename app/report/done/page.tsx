import Link from "next/link";
import type { Metadata } from "next";
import { ROUTES } from "@/app/_lib/routes";
import { ReportCtaFooter } from "../_components/report-cta-footer";

// 실측 출처: 장보고 Design `d5j7K9BNpSXxVUu3fmZfY4` / `화면GUI(원본)` 364:6742 — 상세는 `app/report/page.tsx` 머리말.

// F04-4 제보 완료 — Figma 화면GUI(원본) 364:8307.
//
// **Server Component다.** 인터랙션이 링크 2개뿐이라 클라이언트 지시어가 없다.
//
// get_design_context 실측:
//   헤더·GNB **없음** (Status Bar만 — iOS 목업이라 구현 대상 아님)
//   complete-body  x120 y261.5 · w-[150px] · flex flex-col **gap-[20px]** items-center
//     illust       **132×132 · bg surface/secondary** ← Figma에서도 회색 사각형 placeholder다
//     text         flex flex-col **gap-[12px]** items-center text-center w-full
//       제목       title/24-semibold · content/primary  "제보 성공!"
//       설명       body/16-medium   · content/secondary  2줄
//   footer         y728 h116 · border-t border/secondary · px-[16px] pt-[8px] pb-[12px] · gap-[8px]
//     링크         px-[16px] py-[8px] · body/14-medium · **#262f3c(content/primary)** · **밑줄**
//     버튼         action-secondary/default · px-[28px] py-[12px] · radius/lg · w-full
//
// ✅ 본문 세로 위치는 **정확히 가운데**다 — 콘텐츠 영역 44~728의 중심이 386이고, 본문(h249)의
//    중심도 261.5+124.5 = 386이다. 그래서 y=261.5 소수점 좌표를 옮기지 않고 flex 가운데 정렬로
//    대체했다(390 아닌 폭·높이에서도 유지된다).
//
// ⚠️ `complete-body`와 설명 텍스트에 **w-150 고정 폭**이 걸려 있다. 한국어 텍스트에 고정 폭을 주면
//    실데이터에서 깨지므로 버렸다 — `max-w`로 줄바꿈 위치만 시안과 맞춘다.
//    (GUI피드백.md에 기록)
//
// ⚠️ 일러스트가 Figma에서도 placeholder라 그 회색 사각형을 그대로 옮겼다. 그림이 확정되면 이 자리만
//    바꾼다. **에셋 누락이 아니라 시안의 현재 상태다.**
//
// ⚠️ 문구 "3번 더 제보하시면 제보 고수가 될 수 있어요"의 **숫자 근거가 없다** — 등급 규칙
//    (`badge/reporter-rank`)과 이어지는 값으로 보이는데 산식이 어디에도 정의돼 있지 않다.
//    지금은 시안 문구를 그대로 두고 상수로 뽑지 않았다(GUI피드백.md에 기록).
//
// ⚠️ 링크 "이 가게에서 더 제보하기"의 이동 대상이 시안에 없다. 같은 가게를 유지하고 품목만 바꾸는
//    흐름(`shared/pages.md` F04-3 "이 가게 가격 더 입력하기")으로 읽어 **제보 폼으로 되돌린다** —
//    다만 가게 id를 물고 오지 못한다(이 화면이 쿼리를 받지 않는다). 진입 규약이 정해지면 여기만 바꾼다.
//
// 대비: 제목 content/primary 13.51:1 · 설명 content/secondary 4.79:1 · 링크 content/primary
//       13.51:1(밑줄까지 있어 색 단독 의존도 아니다) → 전부 통과.

export const metadata: Metadata = {
  title: "제보 완료 | 장보고",
};

export default function ReportDonePage() {
  return (
    <main className="min-h-dvh bg-surface-secondary">
      <div className="mx-auto flex h-dvh w-full max-w-97.5 flex-col overflow-hidden bg-surface-primary">
        <div className="flex flex-1 items-center justify-center px-4">
          <div className="flex flex-col items-center gap-5">
            {/* Figma에서도 placeholder(132×132 회색 사각형)다 — 그림이 오면 이 자리를 바꾼다. */}
            <div className="size-33 shrink-0 bg-surface-secondary" aria-hidden="true" />
            <div className="flex flex-col items-center gap-3 text-center">
              <h1 className="text-title-24-semibold text-content-primary">제보 성공!</h1>
              <p className="max-w-37.5 text-body-16-medium text-content-secondary">
                3번 더 제보하시면
                <br />
                제보 고수가 될 수 있어요
              </p>
            </div>
          </div>
        </div>

        <ReportCtaFooter
          above={
            <Link
              href={ROUTES.report}
              className="flex items-center justify-center px-4 py-2 text-body-14-medium text-content-primary underline"
            >
              이 가게에서 더 제보하기
            </Link>
          }
        >
          {/*
            ⚠️ `Button`을 쓰지 않고 Link에 클래스를 직접 얹었다. 이 CTA는 **이동**이라 `<a>`여야
               하는데(오른쪽 클릭·새 탭·미들클릭이 살아야 한다) `button.tsx`에는 asChild/Slot이
               없어서 다른 태그로 렌더할 수 없다. asChild를 뚫는 건 컴포넌트 규격 변경이라
               이번 작업 범위 밖이다(별도 세션) → 그때 이 블록을 `<Button asChild>`로 되돌린다.
               클래스는 Button secondary·medium과 같은 값이다
               (BASE + rounded-lg px-7 py-3 + bg-action-secondary-default + body-16-semibold).
          */}
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
