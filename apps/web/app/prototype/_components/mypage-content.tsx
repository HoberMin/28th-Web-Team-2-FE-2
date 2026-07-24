"use client";

import { type ReactNode, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getBaselineDummy, getVegetable } from "../_lib/vegetables";
import { useFavorites } from "../_lib/favorites-store";
import { useMyReports } from "../_lib/reports-store";
import { useCurrentDistrict } from "../_lib/location";
import { useOnboarding } from "../_lib/onboarding-store";
import { summarizeSpending, toSpendingItem, type SpendingSummary } from "../_lib/spending";
import { formatDateDot, formatNumber, formatWon } from "../_lib/format";
import type { Report } from "../_lib/types";
import { FavoriteButton } from "./favorite-button";

type Tab = "favorites" | "reports" | "purchases";
const TABS: { key: Tab; label: string }[] = [
  { key: "favorites", label: "찜한 야채" },
  { key: "reports", label: "제보 내역" },
  { key: "purchases", label: "구매 내역" },
];

// 마이페이지 본문 — 프로필·소비 요약·탭(찜/제보/구매). 데이터가 모두 localStorage라 클라 leaf.
export function MyPageContent() {
  const [tab, setTab] = useState<Tab>("favorites");
  const { district, loading } = useCurrentDistrict();
  const { nickname } = useOnboarding();
  const favorites = useFavorites();
  const myReports = useMyReports();

  // 제보 내역 = 내 제보 전체(샀든 안 샀든), 구매 내역 = 실제로 산 것(purchased)만.
  const purchases = myReports.filter((r) => r.purchased);
  const summary = summarizeSpending(purchases);
  // 온보딩에서 설정한 닉네임 우선, 없으면 동네 이웃으로 폴백.
  const displayName = nickname || (loading ? "우리 동네 이웃" : `${district} 이웃`);

  return (
    <div className="flex flex-col gap-6 px-4 pt-1 pb-10">
      {/* 프로필 */}
      <div className="flex items-center gap-3">
        <span className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-bg-neutral-weak">
          <Image src="/veg/mypage.svg" alt="" width={40} height={40} className="size-10" />
        </span>
        <div className="flex min-w-0 flex-col">
          <p className="text-head2-18 text-fg-neutral">{displayName}</p>
          <p className="text-body-14-regular text-fg-neutral-subtle">
            찜 {favorites.length} · 제보 {myReports.length} · 구매 {purchases.length}
          </p>
        </div>
      </div>

      {/* 탭 */}
      <div role="group" aria-label="마이페이지 목록" className="flex gap-1 rounded-xl bg-bg-neutral-weak p-1">
        {TABS.map((t) => {
          const selected = t.key === tab;
          return (
            <button
              key={t.key}
              type="button"
              aria-pressed={selected}
              onClick={() => setTab(t.key)}
              className={`min-h-9 flex-1 rounded-lg py-1.5 text-body-14-medium transition-colors ${
                selected ? "bg-bg-layer-default text-fg-neutral shadow-sm" : "text-fg-neutral-subtle"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* 탭 내용 */}
      {tab === "favorites" && <FavoritesTab favorites={favorites} />}
      {tab === "reports" && <ReportsTab reports={myReports} />}
      {tab === "purchases" && <PurchasesTab reports={purchases} summary={summary} />}
    </div>
  );
}

function SpendingSummaryCard({ count, spent, saved }: { count: number; spent: number; saved: number }) {
  if (count === 0) {
    return (
      <section aria-label="내 소비 요약" className="rounded-2xl bg-bg-neutral-weak px-5 py-6">
        <p className="text-body-14-regular text-fg-neutral-subtle">
          야채를 사고 가격을 제보하면
          <br />
          시세보다 얼마나 아꼈는지 알려드려요.
        </p>
      </section>
    );
  }

  const savedPositive = saved >= 0;
  return (
    <section aria-label="내 소비 요약" className="flex flex-col gap-3 rounded-2xl bg-bg-brand-weak px-5 py-5">
      <p className="text-body-14-medium text-fg-brand">지금까지 시세 대비</p>
      <p className="text-head2-20 text-fg-neutral">
        <span className={savedPositive ? "text-fg-positive" : "text-fg-warning"}>
          {formatNumber(Math.abs(saved))}원
        </span>{" "}
        {savedPositive ? "아꼈어요" : "더 썼어요"}
      </p>
      <div className="flex items-center justify-between border-t border-bg-brand-weak-pressed pt-3 text-body-14-regular">
        <span className="text-fg-neutral-subtle">구매 {count}건</span>
        <span className="text-fg-neutral">총 지출 {formatWon(spent)}</span>
      </div>
    </section>
  );
}

function EmptyState({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-xl bg-bg-neutral-weak px-4 py-10 text-center text-body-14-regular text-fg-neutral-subtle">
      {children}
    </p>
  );
}

function FavoritesTab({ favorites }: { favorites: string[] }) {
  if (favorites.length === 0) {
    return (
      <EmptyState>
        아직 찜한 야채가 없어요.
        <br />
        관심 야채에 하트를 눌러 보세요.
      </EmptyState>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {favorites.map((id) => {
        const veg = getVegetable(id);
        if (!veg) return null;
        const price = getBaselineDummy(veg.id).current;
        return (
          <li key={id} className="relative flex items-center rounded-2xl bg-bg-neutral-weak">
            <Link
              href={`/prototype/price/${veg.id}`}
              className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl py-3 pl-3 pr-14 active:bg-bg-neutral-weak-pressed"
            >
              <Image src={veg.image} alt="" width={48} height={48} className="size-12 shrink-0 object-contain" />
              <span className="flex min-w-0 flex-col">
                <span className="text-body-16-semibold text-fg-neutral">{veg.name}</span>
                <span className="text-body-14-regular text-fg-neutral-subtle">
                  오늘 시세 {formatWon(price)} <span className="text-fg-neutral-subtle">/{veg.unit}</span>
                </span>
              </span>
            </Link>
            <span className="absolute right-2">
              <FavoriteButton vegetableId={veg.id} vegetableName={veg.name} size="sm" />
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function ReportsTab({ reports }: { reports: Report[] }) {
  if (reports.length === 0) {
    return (
      <EmptyState>
        아직 제보한 내역이 없어요.
        <br />
        야채 시세 화면에서 실제 가격을 제보해 보세요.
      </EmptyState>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {reports.map((r) => {
        const veg = getVegetable(r.vegetableId);
        // 오늘 시세(더미 기준선)와 제보한 1kg 환산가의 차이(+ = 시세보다 저렴, - = 비쌈).
        const diff = getBaselineDummy(r.vegetableId).current - r.pricePerKg;
        return (
          <li
            key={r.id}
            className="flex items-center justify-between rounded-2xl bg-bg-neutral-weak px-4 py-3"
          >
            <span className="flex min-w-0 flex-col">
              <span className="flex items-center gap-1.5">
                <span className="text-body-16-semibold text-fg-neutral">{veg?.name ?? r.vegetableId}</span>
                {!r.purchased && (
                  <span className="rounded-md bg-bg-neutral-weak-pressed px-1.5 py-0.5 text-caption-12-regular text-fg-neutral-subtle">
                    시세만 봄
                  </span>
                )}
              </span>
              <span className="text-caption-12-regular text-fg-neutral-subtle">
                {formatDateDot(r.createdAt.slice(0, 10))} · {r.district}
              </span>
            </span>
            <span className="flex flex-col items-end gap-0.5">
              <span className="text-body-14-medium text-fg-neutral">
                {formatNumber(r.pricePerKg)}원 <span className="text-fg-neutral-subtle">/1kg</span>
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
          </li>
        );
      })}
    </ul>
  );
}

// 구매 내역 = 실제로 산 제보(purchased)만. "얼마나 아꼈다" 요약을 이 탭 전용으로 분리한다.
function PurchasesTab({ reports, summary }: { reports: Report[]; summary: SpendingSummary }) {
  return (
    <div className="flex flex-col gap-4">
      {/* 시세 대비 절약 요약(핵심 가치: 눈으로 보는 변화) — count===0이면 안내 문구로 폴백 */}
      <SpendingSummaryCard count={summary.count} spent={summary.spent} saved={summary.saved} />
      {reports.length > 0 && (
        <ul className="flex flex-col gap-2">
          {reports.map((r) => {
            const veg = getVegetable(r.vegetableId);
            // 산 가격(전체 무게)과 같은 품목 현재 시세의 차이 → 절약/초과.
            const { saved } = toSpendingItem(r);
            const savedPositive = saved >= 0;
            return (
              <li
                key={r.id}
                className="flex items-center justify-between rounded-2xl bg-bg-neutral-weak px-4 py-3"
              >
                <span className="flex min-w-0 flex-col">
                  <span className="text-body-16-semibold text-fg-neutral">
                    {veg?.name ?? r.vegetableId}{" "}
                    <span className="text-body-14-regular text-fg-neutral-subtle">{r.weightKg}kg</span>
                  </span>
                  <span className="text-caption-12-regular text-fg-neutral-subtle">
                    {formatDateDot(r.createdAt.slice(0, 10))} · {r.district}
                  </span>
                </span>
                <span className="flex flex-col items-end">
                  <span className="text-body-16-semibold text-fg-neutral">{formatWon(r.price)}</span>
                  <span
                    className={`text-caption-12-regular ${savedPositive ? "text-fg-positive" : "text-fg-warning"}`}
                  >
                    시세보다 {formatNumber(Math.abs(saved))}원 {savedPositive ? "절약" : "초과"}
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
