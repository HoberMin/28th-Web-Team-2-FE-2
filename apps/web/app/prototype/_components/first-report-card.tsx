"use client";

import { useMyReports, useReports } from "../_lib/reports-store";
import { useCurrentDistrict } from "../_lib/location";
import { CalloutLink } from "./callout-link";

// 첫 제보 유도 — 제보를 한 번도 안 한 사람에게만 보인다.
//
// 왜 필요한가: 크라우드소싱은 첫 기여가 가장 어렵다. 온보딩에서 동네까지 정했는데도
// "왜 내가 제보해야 하나"에 답이 없으면 소비만 하고 끝난다. **우리 동네에 제보가 몇 건 있는지**를
// 함께 보여줘서 "여기 사람들이 이미 쓰고 있다 / 아직 내가 첫 번째다" 둘 중 하나로 동기를 만든다.
export function FirstReportCard() {
  const myReports = useMyReports();
  const { district } = useCurrentDistrict();
  const districtReports = useReports({ district });

  // 제보를 이미 한 사람에게는 보이지 않는다(할 일 카드가 남아 있으면 잔소리가 된다).
  if (myReports.length > 0) return null;

  const isFirst = districtReports.length === 0;

  return (
    <section
      aria-label="첫 제보 안내"
      className="flex flex-col gap-2 rounded-2xl bg-bg-neutral-weak px-5 py-4"
    >
      <p className="text-body-16-semibold text-fg-neutral">
        {isFirst ? `${district} 첫 제보를 남겨보세요` : "아직 제보를 안 하셨어요"}
      </p>
      <p className="text-body-14-regular text-fg-neutral-muted">
        {isFirst
          ? "우리 동네 가격 기록이 아직 없어요. 첫 제보가 이웃의 기준이 됩니다."
          : `${district} 이웃이 ${districtReports.length}건 남겼어요. 오늘 본 가격 하나만 알려주시면 내 절약 금액도 계산돼요.`}
      </p>
      <div className="mt-1">
        <CalloutLink href="/prototype/judge">가격 하나 알려주기</CalloutLink>
      </div>
    </section>
  );
}
