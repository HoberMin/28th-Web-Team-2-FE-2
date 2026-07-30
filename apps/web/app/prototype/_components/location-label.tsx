"use client";

import { useState } from "react";
import IconLocationpinFill from "@karrotmarket/react-monochrome-icon/IconLocationpinFill";
import IconChevronRightLine from "@karrotmarket/react-monochrome-icon/IconChevronRightLine";
import {
  BottomSheetBody,
  BottomSheetContent,
  BottomSheetRoot,
} from "seed-design/ui/bottom-sheet";
import { useCurrentDistrict } from "../_lib/location";
import { addDistrict, setActiveDistrict, useDistricts } from "../_lib/onboarding-store";
import { RegionPicker } from "./region-picker";

type SheetView = "list" | "picker";

// GPS 기반 현재 동 표시 (홈·시세 상단) + 탭하면 등록된 동네 전환 drawer.
// 등록 목록은 최대 3개(onboarding-store 규칙) — "다른 동네 찾기"로 검색해 새로 등록·즉시 전환.
export function LocationLabel() {
  const { district, loading } = useCurrentDistrict();
  const districts = useDistricts();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<SheetView>("list");

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) setView("list");
  }

  function handlePick(name: string) {
    setActiveDistrict(name);
    handleOpenChange(false);
  }

  function handleAddAndActivate(name: string) {
    addDistrict(name);
    setActiveDistrict(name);
    handleOpenChange(false);
  }

  return (
    <BottomSheetRoot open={open} onOpenChange={(nextOpen) => handleOpenChange(nextOpen)}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 text-fg-neutral"
      >
        <span className="text-fg-brand-contrast [&_svg]:size-6" aria-hidden="true">
          <IconLocationpinFill />
        </span>
        <span className="text-head2-16">{loading ? "위치 확인 중…" : district}</span>
        <span className="text-fg-neutral-muted [&_svg]:size-4" aria-hidden="true">
          <IconChevronRightLine />
        </span>
      </button>

      <BottomSheetContent
        title={view === "list" ? "동네 선택" : "다른 동네 찾기"}
        showHandle
      >
        <BottomSheetBody className="flex flex-col gap-2 pb-4">
          {view === "list" ? (
            <>
              <ul className="flex flex-col">
                {districts.map((name) => {
                  const active = name === district;
                  return (
                    <li key={name}>
                      <button
                        type="button"
                        onClick={() => handlePick(name)}
                        className="flex h-12 w-full items-center justify-between text-left active:bg-bg-neutral-weak"
                      >
                        <span
                          className={
                            active
                              ? "text-body-16-semibold text-fg-brand-contrast"
                              : "text-body-16-regular text-fg-neutral"
                          }
                        >
                          {name}
                        </span>
                        {active && (
                          <span className="text-caption-12-regular text-fg-brand-contrast">현재 동네</span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
              <button
                type="button"
                onClick={() => setView("picker")}
                className="flex h-12 w-full items-center rounded-xl bg-bg-neutral-weak px-4 text-left text-body-14-medium text-fg-neutral active:bg-bg-neutral-weak-pressed"
              >
                다른 동네 찾기
              </button>
            </>
          ) : (
            <>
              {/* 검색 뷰에서 목록으로 되돌아갈 길 — 없으면 시트를 닫았다 다시 여는 수밖에 없다 */}
              <button
                type="button"
                onClick={() => setView("list")}
                className="flex h-11 items-center gap-1 self-start text-body-14-medium text-fg-neutral-muted active:text-fg-neutral"
              >
                <span className="rotate-180 [&_svg]:size-4" aria-hidden="true">
                  <IconChevronRightLine />
                </span>
                등록된 동네 보기
              </button>
              <RegionPicker anchorDistrict={district} onSelect={handleAddAndActivate} />
            </>
          )}
        </BottomSheetBody>
      </BottomSheetContent>
    </BottomSheetRoot>
  );
}
