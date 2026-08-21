import type { DailyReport } from "@/app/_lib/api/schemas/my-reports";
import { cn } from "@/app/_lib/cn";

// F05 「이번 주 제보」 — `GET /api/v1/users/me/reports/weekly`.
//
// **Figma 시안이 없다**(`shared/pages.md` §시안 없음). 새 규격을 지어내지 않으려고 색·타이포를
// 전부 기존 토큰에서 빌려 왔다 — 제보한 날은 `badge/report-date`의 today 조합
// (surface/accent-orange + content/accent-badge), 안 한 날은 yesterday 조합
// (surface/secondary + content/secondary)을 그대로 쓴다. 시안이 오면 이 파일을 교체한다.
//
// 서버가 제보 0건이어도 7일을 `hasReported: false`로 채워 주므로 빈 배열 분기가 필요 없다.

const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"] as const;

/** `YYYY-MM-DD`를 로컬 요일로 읽는다. 날짜만 있는 값이라 UTC로 파싱해 시간대 밀림을 막는다. */
function weekdayLabel(date: string): string {
  const parsed = new Date(`${date}T00:00:00Z`);
  return WEEKDAY_LABELS[parsed.getUTCDay()] ?? "";
}

function dayNumber(date: string): string {
  return String(Number(date.slice(8, 10)));
}

export interface WeeklyReportStripProps {
  totalReportedDays: number;
  dailyReports: DailyReport[];
}

export function WeeklyReportStrip({ totalReportedDays, dailyReports }: WeeklyReportStripProps) {
  return (
    <section aria-labelledby="weekly-report-heading" className="pt-6">
      <div className="flex items-baseline justify-between">
        <h2 id="weekly-report-heading" className="text-body-16-semibold text-content-primary">
          이번 주 제보
        </h2>
        <p className="text-body-14-medium text-content-secondary">
          {totalReportedDays === 0 ? "아직 없어요" : `${totalReportedDays}일`}
        </p>
      </div>
      <ul className="mt-3 flex items-stretch justify-between gap-1">
        {dailyReports.map((day) => (
          <li key={day.date} className="min-w-0 flex-1">
            <div
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-sm py-2",
                day.hasReported
                  ? "bg-surface-accent-orange text-content-accent-badge"
                  : "bg-surface-secondary text-content-secondary",
              )}
            >
              <span className="text-caption-12-regular">{weekdayLabel(day.date)}</span>
              <span className="text-caption-12-semibold">{dayNumber(day.date)}</span>
            </div>
            {/* 제보한 품목 이름은 색만으로 상태를 알리지 않기 위한 텍스트 단서다(WCAG 1.4.1). */}
            <p className="mt-1 truncate text-center text-caption-12-regular text-content-disabled">
              {day.hasReported ? (day.itemName ?? "제보") : "-"}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
