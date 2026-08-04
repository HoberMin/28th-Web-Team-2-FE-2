"use client";

// 마이페이지 주간 캘린더 — 이번 주(월~일) 중 제보한 날에 야채 일러스트 스탬프를 찍는다.
//
// 여기서 이전에 있던 절약 카드(누적/이번 주 아낀 금액·총 지출·구매 건수·"가장 잘 산 건 …")를
// 전부 걷어냈다. 구매 인증 개념 자체를 버리고 제보로 가기로 하면서(2026-08-04), 구매 데이터에
// 기대던 금액 지표가 근거를 잃었다. 남는 동기 장치가 이 캘린더다 — "이번 주에 내가 몇 번
// 알려줬나"를 금액이 아니라 흔적으로 보여준다.
//
// 스탬프 그림은 그날 제보한 야채의 일러스트를 그대로 쓴다(새 에셋 없이, 무엇을 제보했는지도 남게).

import Image from "next/image";
import { useMyReports } from "../_lib/reports-store";
import { getVegetable } from "../_lib/vegetables";

const WEEKDAYS = ["월", "화", "수", "목", "금", "토", "일"];

/** 이번 주 월요일 0시(로컬)를 기준으로 7일 날짜 키(YYYY-MM-DD)를 만든다. */
function weekDayKeys(todayIso: string): string[] {
  const today = new Date(`${todayIso}T00:00:00`);
  // getDay(): 일=0 … 월=1. 월요일 시작으로 맞추려면 일요일을 6칸 뒤로 보낸다.
  const offsetToMonday = (today.getDay() + 6) % 7;
  const monday = new Date(today);
  monday.setDate(today.getDate() - offsetToMonday);
  return WEEKDAYS.map((_, i) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + i);
    // toISOString()은 UTC로 밀려 새벽에 날짜가 하루 어긋난다 → 로컬 값으로 직접 조립한다.
    const month = `${day.getMonth() + 1}`.padStart(2, "0");
    const date = `${day.getDate()}`.padStart(2, "0");
    return `${day.getFullYear()}-${month}-${date}`;
  });
}

export function WeeklyCalendar({ todayIso }: { todayIso: string }) {
  const myReports = useMyReports();
  const keys = weekDayKeys(todayIso);

  // 날짜별 첫 제보 하나만 스탬프로 쓴다(같은 날 여러 건이어도 칸은 하나다).
  const stampByDate = new Map<string, string>();
  myReports.forEach((report) => {
    const date = report.createdAt.slice(0, 10);
    if (!stampByDate.has(date)) stampByDate.set(date, report.vegetableId);
  });

  const stampedCount = keys.filter((key) => stampByDate.has(key)).length;

  return (
    <section aria-label="이번 주 제보" className="flex flex-col gap-3 rounded-2xl bg-gray-100 px-4 py-4">
      <div className="flex items-baseline justify-between">
        <h2 className="text-body-16-semibold text-content-primary">이번 주 제보</h2>
        <span className="text-caption-12-regular tabular-nums text-content-secondary">
          {stampedCount === 0 ? "아직 없어요" : `${stampedCount}일 제보`}
        </span>
      </div>

      <ul className="grid grid-cols-7 gap-1">
        {keys.map((key, i) => {
          const vegetableId = stampByDate.get(key);
          const veg = vegetableId ? getVegetable(vegetableId) : undefined;
          const isToday = key === todayIso;
          const dayNumber = Number(key.slice(8, 10));
          return (
            <li key={key} className="flex flex-col items-center gap-1">
              <span className="text-caption-12-regular text-content-secondary">{WEEKDAYS[i]}</span>
              <span
                className={`flex size-9 items-center justify-center rounded-full ${
                  veg ? "bg-orange-50" : "bg-surface-primary"
                } ${isToday ? "ring-1 ring-orange-700" : ""}`}
              >
                {veg ? (
                  // 스탬프가 찍힌 날은 숫자 대신 그림 — 한 줄 훑을 때 "찍힌 날"이 먼저 읽혀야 한다.
                  veg.image ? (
                    <Image
                      src={veg.image}
                      alt={`${veg.name} 제보`}
                      width={22}
                      height={22}
                      className="object-contain"
                      style={{ width: 22, height: 22 }}
                    />
                  ) : (
                    <span role="img" aria-label={`${veg.name} 제보`} className="text-body-14-medium">
                      {veg.emoji}
                    </span>
                  )
                ) : (
                  <span className="text-caption-12-regular tabular-nums text-content-secondary">
                    {dayNumber}
                  </span>
                )}
              </span>
            </li>
          );
        })}
      </ul>

      {stampedCount === 0 && (
        <p className="text-caption-12-regular text-content-secondary">
          가격을 제보한 날에는 야채 도장이 찍혀요.
        </p>
      )}
    </section>
  );
}
