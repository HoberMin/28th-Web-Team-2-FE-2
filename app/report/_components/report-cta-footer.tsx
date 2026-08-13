import type { ReactNode } from "react";
import { cn } from "@/app/_lib/cn";

// 실측 출처: 장보고 Design `d5j7K9BNpSXxVUu3fmZfY4` / `화면GUI(원본)` 364:6742 — 상세는 `app/report/page.tsx` 머리말.

// 제보 플로우 하단 CTA 바 — Figma 364:8172 / 8200 / 8264 / 8292 / 8109 / 8119 / 8125 / 8143.
//
// ⚠️ **Figma에서 이 프레임의 레이어 이름이 자동 이름 2종으로 갈려 있다** —
//    `Frame 2085673561`(4프레임) · `Frame 2085673652`(3프레임). 같은 390×74 규격인데 이름이 둘이다.
//    (GUI피드백.md에 기록 — 디자이너가 이름을 정리해야 닫히는 항목)
//
// get_design_context 실측(364:8172):
//   bg surface/primary · **border-t border/secondary** · flex flex-col items-start
//   px-[16px] py-[12px] · w-[390px] · 높이는 hug (12 + 버튼 49 + 12 + 테두리 1 = 74)
//   안쪽 button/base = `action-secondary/default` px-[28px] py-[12px] radius/lg w-full
//                      라벨 body/16-semibold · content/inverse
//
// 버튼은 이 컴포넌트가 만들지 않고 슬롯으로 받는다 — 라벨·disabled·onClick이 화면마다 다르고,
// 이 컴포넌트는 Server Component로 남아야 해서 여기서 핸들러를 만들 수 없다(conventions #10).
//
// ⚠️ Figma CTA가 `action-secondary`(검정 #262f3c)다. 온보딩 CTA는 `action-primary`(초록)였다 —
//    같은 "확인" 버튼인데 플로우마다 색이 다르다. 원본을 그대로 옮기고 사실만 기록한다(figma-bridge §4).
//
// ⚠️ home indicator(34)는 Figma 전 프레임에 없다(GUI피드백 63번) — `pb-safe` 류를 임의로
//    넣지 않았다. 시안에 없는 여백을 코드가 발명하면 정합이 깨진다.

export interface ReportCtaFooterProps {
  /** 하단 고정 버튼. 보통 `<Button variant="secondary" className="w-full">`. */
  children: ReactNode;
  /** 버튼 위에 오는 보조 링크(F04-4 제보 완료에만 있다). */
  above?: ReactNode;
  className?: string;
}

export function ReportCtaFooter({ children, above, className }: ReportCtaFooterProps) {
  return (
    <footer
      className={cn(
        "flex w-full flex-col items-stretch gap-2 border-t border-border-secondary bg-surface-primary px-4 pb-3",
        // Figma 실측: 버튼만 있는 화면은 pt-[12px], 보조 링크가 있는 F04-4는 pt-[8px].
        above ? "pt-2" : "pt-3",
        className,
      )}
    >
      {above}
      {children}
    </footer>
  );
}
