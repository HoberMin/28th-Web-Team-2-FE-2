"use client";

import { useState, type ReactNode } from "react";
import IconChevronDownLine from "@karrotmarket/react-monochrome-icon/IconChevronDownLine";

// 접히는 섹션 — 시세 화면(F03)에서 **판단에 필요한 정보와 둘러보기 정보를 위계로 가른다.**
// 레시피·댓글처럼 "지금 살까?"를 판단하는 데 필요하지 않은 섹션은 기본으로 접어
// 판단 근거(시세·동네 제보가)가 스크롤 없이 읽히게 한다.
//
// a11y: 버튼이 heading을 감싸지 않고 heading 안에 버튼을 둔다(스크린리더 목차가 유지된다).
export function CollapsibleSection({
  title,
  note,
  children,
  defaultOpen = false,
}: {
  title: string;
  /** 제목 오른쪽 보조 문구(예: "예시") */
  note?: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section aria-label={title} className="flex flex-col gap-3 px-4 pt-6">
      <h2 className="text-head2-18 text-fg-neutral">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex min-h-11 w-full items-center justify-between gap-2 text-left"
        >
          <span className="flex items-baseline gap-2">
            {title}
            {note && <span className="text-caption-12-regular text-fg-neutral-subtle">{note}</span>}
          </span>
          <span
            className={`shrink-0 text-fg-neutral-subtle transition-transform [&_svg]:size-5 ${
              open ? "rotate-180" : ""
            }`}
            aria-hidden="true"
          >
            <IconChevronDownLine />
          </span>
        </button>
      </h2>
      {open && children}
    </section>
  );
}
