"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { getPriceVegetableImage } from "@/app/(tabs)/prices/_images";
import { ListRecentReport } from "@/app/_components/list-recent-report";
import { RowRecentReport } from "@/app/_components/row-recent-report";
import type { BadgeReportDateVariant } from "@/app/_components/badge-report-date";
import type { MyReport } from "@/app/_lib/api/schemas/my-reports";
import { formatWon } from "@/app/_lib/format";
import { deleteMyReportAction } from "../_actions";

// F05 「내 제보」 목록 — `GET /api/v1/users/me/reports`.
//
// **Figma 시안이 없다.** 새 규격을 지어내는 대신 이미 있는 `row/recent-report`(359-18537)와
// `list/recent-report`(392-11786)를 그대로 재사용한다 — 야채 그림·이름·시점 배지·가격이라는
// 구성이 내 제보 한 줄과 같다. 삭제 버튼만 그 오른쪽에 덧붙인다(원본에 없는 요소라
// 목록 밖에 두지 않고 행 컨테이너에서 감싼다).
//
// 수정(PATCH)은 값 입력 폼이 필요해 여기서 다루지 않는다 — 제보 화면 수준의 시안이 필요하다.

interface MyReportListProps {
  reports: MyReport[];
  /** 오늘/어제 배지를 계산할 기준일 `YYYY-MM-DD`. 서버에서 한 번 고정해 넘긴다. */
  today: string;
}

/** 오늘·어제만 배지를 붙인다(Figma가 그 두 값만 갖고 있다). 그 이전은 배지 없음. */
function reportDateVariant(reportedDate: string, today: string): BadgeReportDateVariant | undefined {
  if (reportedDate === today) return "today";
  const yesterday = new Date(`${today}T00:00:00Z`);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  return reportedDate === yesterday.toISOString().slice(0, 10) ? "yesterday" : undefined;
}

export function MyReportList({ reports, today }: MyReportListProps) {
  const router = useRouter();
  const [pendingReportId, setPendingReportId] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function handleDelete(reportId: number) {
    setMessage(null);
    setPendingReportId(reportId);
    startTransition(async () => {
      const result = await deleteMyReportAction(reportId);
      setPendingReportId(null);
      if (result.ok) {
        router.refresh();
        return;
      }
      setMessage(result.message);
    });
  }

  return (
    <div className="flex flex-col">
      <ListRecentReport label="내가 올린 제보">
        {reports.map((report) => (
          <div key={report.reportId} className="flex items-center gap-2">
            <div className="min-w-0 flex-1">
              <RowRecentReport
                visual={
                  <Image
                    src={getPriceVegetableImage(report.itemName ?? "")}
                    alt=""
                    width={40}
                    height={40}
                    className="size-10 object-contain"
                  />
                }
                name={report.itemName ?? "품목 미상"}
                reportDate={reportDateVariant(report.reportedDate, today)}
                price={formatWon(report.price)}
                unit={`/${report.unit}`}
              />
            </div>
            <button
              type="button"
              onClick={() => handleDelete(report.reportId)}
              disabled={pendingReportId !== null}
              className="min-h-11 shrink-0 px-2 text-body-14-medium text-content-secondary disabled:text-content-disabled focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-content-primary"
            >
              {pendingReportId === report.reportId ? "지우는 중" : "삭제"}
            </button>
          </div>
        ))}
      </ListRecentReport>
      {message ? (
        <p role="alert" className="pt-2 text-body-14-regular text-content-accent-badge">
          {message}
        </p>
      ) : null}
    </div>
  );
}
