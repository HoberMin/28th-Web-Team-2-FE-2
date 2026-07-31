"use client";

import { useRouter } from "next/navigation";
import { AppBar, PhoneFrame, Scroll } from "../_lib/shell";
import { useReports } from "../_lib/reports-store";
import { useCurrentDistrict } from "../_lib/location";
import { buildReporterRanking } from "../_lib/ranking";
import { getReportAge } from "../_lib/stores";
import { getVegetable } from "../_lib/vegetables";
import { formatWon } from "../_lib/format";
import { ProfileAvatar } from "./profile-avatar";
import { VegetableThumb } from "./vegetable-thumb";
import { EmptyState } from "./empty-state";

/**
 * F06-1 공개 제보 목록 — 제보왕(F06)에서 사람을 눌러 들어오는 화면.
 * 공개하는 값은 닉네임·아바타·순위·건수·제보 목록(품목·가격·가게·시점)뿐이다.
 * **구매 여부·절약액 같은 개인 정보는 절대 넣지 않는다** — 그건 마이페이지 "내 제보"만의 값이다.
 *
 * 순위는 제보왕 리더보드와 같은 범위(현재 동네)로 계산한다 — 이 화면은 항상 그 리더보드에서
 * 들어오므로 다른 동네 기준을 쓰면 방금 본 순위와 어긋난다.
 */
export function ReporterProfile({ nickname, todayIso }: { nickname: string; todayIso: string }) {
  const router = useRouter();
  const { district, loading } = useCurrentDistrict();
  const reports = useReports({ district });
  const ranking = buildReporterRanking(reports);
  const entry = ranking.find((r) => r.nickname === nickname);
  const myReports = reports
    .filter((r) => r.nickname === nickname)
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));

  function handleBack() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/prototype/ranking");
    }
  }

  return (
    <PhoneFrame>
      <AppBar title={loading ? "제보왕" : nickname} onBack={handleBack} />
      <Scroll className="px-4 pb-8">
        {loading ? (
          <ReporterProfileLoading />
        ) : !entry ? (
          <div className="flex flex-col items-center gap-2 pt-16 text-center">
            <p className="text-body-16-semibold text-fg-neutral">이 이웃을 찾을 수 없어요</p>
            <p className="text-body-14-regular text-fg-neutral-muted">
              {district} 제보왕 목록에 없는 닉네임이에요.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6 pt-4">
            <section aria-label="제보왕 프로필" className="flex flex-col items-center gap-2 pb-2">
              <ProfileAvatar avatarId={entry.avatarId} size={72} />
              <p className="text-head2-18 text-fg-neutral">{entry.nickname}</p>
              <p className="text-body-14-regular text-fg-neutral-muted">
                {district} {entry.rank}위 · 제보 {entry.reportCount}건
              </p>
            </section>

            <section aria-label="공개 제보 목록" className="flex flex-col gap-2">
              <h2 className="text-head2-16 text-fg-neutral">제보 목록</h2>
              {myReports.length === 0 ? (
                <EmptyState>아직 공개할 제보가 없어요.</EmptyState>
              ) : (
                <ul className="flex flex-col gap-2">
                  {myReports.map((r) => {
                    const veg = getVegetable(r.vegetableId);
                    if (!veg) return null;
                    const age = getReportAge(r.createdAt, todayIso);
                    return (
                      <li
                        key={r.id}
                        className="flex items-center gap-3 rounded-2xl bg-bg-neutral-weak px-4 py-3"
                      >
                        <VegetableThumb image={veg.image} emoji={veg.emoji} size="md" />
                        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                          <span className="text-body-16-semibold text-fg-neutral">{veg.name}</span>
                          <span className="truncate text-caption-12-regular text-fg-neutral-muted">
                            {r.place ?? `${r.district} · 가게 미상`}
                          </span>
                        </span>
                        <span className="flex shrink-0 flex-col items-end">
                          <span className="text-body-14-medium tabular-nums text-fg-neutral">
                            {formatWon(r.pricePerKg)}
                          </span>
                          <span className="text-caption-12-regular text-fg-neutral-muted">{age.label}</span>
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          </div>
        )}
      </Scroll>
    </PhoneFrame>
  );
}

/** 위치를 아직 못 불러온 동안의 자리표시 — 랭킹 화면과 같은 신호(loading)로 빈 상태와 구분한다. */
function ReporterProfileLoading() {
  return (
    <div className="flex flex-col items-center gap-3 pt-8" aria-hidden="true">
      <div className="size-18 animate-pulse rounded-full bg-bg-neutral-weak" />
      <div className="h-4 w-24 animate-pulse rounded-full bg-bg-neutral-weak" />
      <div className="mt-4 flex w-full flex-col gap-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-16 animate-pulse rounded-2xl bg-bg-neutral-weak" />
        ))}
      </div>
    </div>
  );
}
