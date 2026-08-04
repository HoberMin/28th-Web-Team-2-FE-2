"use client";

import { useState } from "react";
import IconDot3HorizontalLine from "@karrotmarket/react-monochrome-icon/IconDot3HorizontalLine";
import IconPencilLine from "@karrotmarket/react-monochrome-icon/IconPencilLine";
import IconTrashcanLine from "@karrotmarket/react-monochrome-icon/IconTrashcanLine";
import { ActionButton } from "seed-design/ui/action-button";
import { TextField, TextFieldInput } from "seed-design/ui/text-field";
import {
  BottomSheetBody,
  BottomSheetContent,
  BottomSheetRoot,
} from "seed-design/ui/bottom-sheet";
import { getVegetable } from "../_lib/vegetables";
import { removeReport, updateReport, useMyReports } from "../_lib/reports-store";
import type { PriceMap } from "../_lib/stores";
import { formatDateDot, formatNumber } from "../_lib/format";
import type { Report } from "../_lib/types";
import { EmptyState } from "./empty-state";

type SheetState = { report: Report; mode: "menu" | "edit" | "delete" } | null;

// 마이페이지 「내 제보」 화면 — 오타 제보(예: 30,000원)를 되돌릴 방법이 전혀 없던 문제를 푼다.
// 항목 우측 ⋯ 메뉴 → 수정(가격·양만, 가벼운 시트) / 삭제(확인 단계).
//
// priceMap은 서버(getPriceMap())가 내려준 오늘 시세 — 홈·시세 화면과 같은 기준(예전엔 더미
// 기준선을 직접 계산해 화면마다 "오늘 시세"가 갈렸다, F05 버그 항목).
//
// ⚠️ 시드 데모 제보(`mine-*`)는 localStorage에 없어 수정·삭제 대상이 아니다 — 그런 항목은
// ⋯ 메뉴 자체를 숨긴다(눌러도 안 먹는 버튼을 보여주지 않는다).
export function ReportsView({ priceMap }: { priceMap: PriceMap }) {
  const reports = useMyReports();
  const [sheet, setSheet] = useState<SheetState>(null);

  if (reports.length === 0) {
    return (
      <EmptyState>
        아직 제보한 내역이 없어요.
        <br />
        야채 시세 화면에서 실제 가격을 제보해 보세요.
      </EmptyState>
    );
  }

  function closeSheet() {
    setSheet(null);
  }

  function handleDelete() {
    if (!sheet) return;
    removeReport(sheet.report.id);
    closeSheet();
  }

  return (
    <>
      <ul className="flex flex-col gap-2">
        {reports.map((r) => {
          const veg = getVegetable(r.vegetableId);
          // 오늘 시세(서버 priceMap)와 제보한 1kg 환산가의 차이(+ = 시세보다 저렴, - = 비쌈).
          // 비수기 등으로 오늘 시세가 없으면(null) 비교하지 않는다.
          const baseline = priceMap[r.vegetableId] ?? null;
          const diff = baseline === null ? 0 : baseline - r.pricePerKg;
          const editable = r.id.startsWith("local-");
          return (
            <li
              key={r.id}
              className="flex items-center gap-2 rounded-2xl bg-bg-neutral-weak px-4 py-3"
            >
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="flex items-center gap-1.5">
                  <span className="text-body-16-semibold text-fg-neutral">
                    {veg?.name ?? r.vegetableId}
                  </span>
                  {/* 「시세만 봄」 배지는 2026-08-04에 뺐다 — 구매 여부를 더 이상 묻지 않으므로
                      새 제보에는 붙을 일이 없고, 옛 제보에만 붙어 있으면 기준이 둘로 보인다. */}
                </span>
                <span className="text-caption-12-regular text-fg-neutral-muted">
                  {formatDateDot(r.createdAt.slice(0, 10))} · {r.district}
                </span>
              </span>
              <span className="flex flex-col items-end gap-0.5">
                <span className="text-body-14-medium text-fg-neutral">
                  {formatNumber(r.pricePerKg)}원 <span className="text-fg-neutral-muted">/1kg</span>
                </span>
                {diff !== 0 && (
                  <span
                    className={`flex items-center gap-0.5 text-caption-12-regular ${
                      diff > 0 ? "text-fg-positive" : "text-fg-critical"
                    }`}
                  >
                    <span aria-hidden="true">{diff > 0 ? "▼" : "▲"}</span>
                    오늘 시세보다 {formatNumber(Math.abs(diff))}원 {diff > 0 ? "저렴" : "비쌈"}
                  </span>
                )}
              </span>
              {editable && (
                <button
                  type="button"
                  aria-label={`${veg?.name ?? r.vegetableId} 제보 수정·삭제`}
                  onClick={() => setSheet({ report: r, mode: "menu" })}
                  className="flex size-9 shrink-0 items-center justify-center rounded-full text-fg-neutral-muted active:bg-bg-neutral-weak-pressed [&_svg]:size-5"
                >
                  <IconDot3HorizontalLine />
                </button>
              )}
            </li>
          );
        })}
      </ul>

      <BottomSheetRoot open={sheet !== null} onOpenChange={(next) => !next && closeSheet()}>
        {sheet?.mode === "menu" && (
          <BottomSheetContent title="제보 관리" showHandle>
            <BottomSheetBody className="flex flex-col gap-1 pb-4">
              <button
                type="button"
                onClick={() => setSheet({ report: sheet.report, mode: "edit" })}
                className="flex h-12 w-full items-center gap-3 rounded-xl px-2 text-left text-body-16-regular text-fg-neutral active:bg-bg-neutral-weak"
              >
                <IconPencilLine className="size-5 text-fg-neutral-muted" aria-hidden="true" />
                수정
              </button>
              <button
                type="button"
                onClick={() => setSheet({ report: sheet.report, mode: "delete" })}
                className="flex h-12 w-full items-center gap-3 rounded-xl px-2 text-left text-body-16-regular text-fg-critical active:bg-bg-neutral-weak"
              >
                <IconTrashcanLine className="size-5" aria-hidden="true" />
                삭제
              </button>
            </BottomSheetBody>
          </BottomSheetContent>
        )}

        {sheet?.mode === "edit" && (
          <EditReportBody report={sheet.report} onDone={closeSheet} />
        )}

        {sheet?.mode === "delete" && (
          <BottomSheetContent title="이 제보를 삭제할까요?" description="삭제하면 되돌릴 수 없어요.">
            <BottomSheetBody className="flex flex-col gap-2 pb-4">
              <ActionButton
                type="button"
                variant="criticalSolid"
                size="large"
                className="w-full"
                onClick={handleDelete}
              >
                삭제
              </ActionButton>
              <ActionButton
                type="button"
                variant="neutralWeak"
                size="large"
                className="w-full"
                onClick={closeSheet}
              >
                취소
              </ActionButton>
            </BottomSheetBody>
          </BottomSheetContent>
        )}
      </BottomSheetRoot>
    </>
  );
}

// 수정 시트 — 위치·품목은 고정하고 양·가격만 고친다(오타 정정이 목적이라 범위를 좁혔다).
function EditReportBody({ report, onDone }: { report: Report; onDone: () => void }) {
  const veg = getVegetable(report.vegetableId);
  const [weight, setWeight] = useState(String(report.weightKg));
  const [price, setPrice] = useState(String(report.price));

  const weightNum = Number(weight.replace(/[^0-9.]/g, ""));
  const priceNum = Number(price.replace(/[^0-9]/g, ""));
  const valid = weightNum > 0 && priceNum > 0;

  function handleSave() {
    if (!valid) return;
    updateReport(report.id, { weightKg: weightNum, price: priceNum });
    onDone();
  }

  return (
    <BottomSheetContent title={`${veg?.name ?? report.vegetableId} 제보 수정`} showHandle>
      <BottomSheetBody className="flex flex-col gap-4 pb-4">
        <TextField
          label="양"
          value={weight}
          onValueChange={(v) => setWeight(v.value)}
          suffix={veg?.unitType ?? "kg"}
        >
          <TextFieldInput placeholder="0" inputMode="decimal" />
        </TextField>
        <TextField label="가격" value={price} onValueChange={(v) => setPrice(v.value)} suffix="원">
          <TextFieldInput placeholder="0" inputMode="numeric" />
        </TextField>
        <ActionButton
          type="button"
          variant="neutralSolid"
          size="large"
          className="w-full"
          disabled={!valid}
          onClick={handleSave}
        >
          저장
        </ActionButton>
      </BottomSheetBody>
    </BottomSheetContent>
  );
}
