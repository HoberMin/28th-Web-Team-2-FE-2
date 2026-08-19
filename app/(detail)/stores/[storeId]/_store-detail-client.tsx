"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import IconClockFill from "@karrotmarket/react-monochrome-icon/IconClockFill";
import type { PrototypeMapStore } from "@/app/(tabs)/stores/_data";
import type { ReporterRank } from "@/app/_components/badge-reporter-rank";
import { ImageStorePlaceholder } from "@/app/_components/image-store-placeholder";
import { ImageVegetableOnion } from "@/app/_components/image-vegetable-onion";
import { ItemComment } from "@/app/_components/item-comment";
import { SheetHandle } from "@/app/_components/sheet-handle";
import type { ReporterTone } from "@/app/_components/image-profile-reporter";
import { FigmaIcon, FigmaImage } from "@/app/_lib/figma-asset";
import { addComment, useComments, type Comment } from "@/app/_lib/comments-store";
import { ROUTES } from "@/app/_lib/routes";
import { StoreDetailBackButton } from "./_back-button";
import type { StoreDetailData, StoreDetailPrice } from "./_data";

interface StoreDetailClientProps {
  store: PrototypeMapStore;
  detail: StoreDetailData;
  dataSource?: "backend-summary" | "temporary";
}

interface FigmaComment {
  id: string;
  nickname: string;
  rank: ReporterRank;
  age: string;
  body: string;
  tone: ReporterTone;
}

const COMMENTS_PAGE_SIZE = 5;

function StoreHero({ imageName, storeName }: { imageName?: string; storeName: string }) {
  if (imageName) {
    return (
      <FigmaImage
        name={imageName}
        alt={`${storeName} 가게 전경`}
        width={390}
        height={220}
        className="h-55 w-full object-cover"
      />
    );
  }

  return (
    <ImageStorePlaceholder />
  );
}

function StoreDataSourceNotice({ dataSource }: { dataSource: StoreDetailClientProps["dataSource"] }) {
  const hasBackendSummary = dataSource === "backend-summary";

  return (
    <div
      role="status"
      data-data-source={dataSource ?? "temporary"}
      className="border-b border-border-secondary bg-surface-accent-orange-subtle px-4 py-2"
    >
      <p className="text-caption-12-semibold text-content-accent-badge">
        {hasBackendSummary ? "기본 가게 정보: 백엔드 연결" : "예시 데이터"}
      </p>
      <p className="text-caption-12-regular text-content-accent-badge">
        상세 콘텐츠: 임시 데이터 · 상세 API 연결 전
      </p>
    </div>
  );
}

function StoreInformation({ store, detail }: StoreDetailClientProps) {
  const [hoursOpen, setHoursOpen] = useState(true);
  // Figma `store-profile-hours-detail`(429:17649)는 2열이다 — 요일 라벨 + 시간 줄 묶음.
  const [dayLabel, ...timeLines] = detail.hours;

  return (
    // 화면GUI(원본) `F03_가게상세` 429:17633 `store-profile-info` 실측(2026-08-19 v3).
    // 사진 bottom 220 → info y240 = pt-20. body가 flex-col gap-[28px]이라 아래로 pb-7(28px).
    <section className="px-4 pt-5 pb-7">
      {/* store-profile-info — flex-col gap-[12px] */}
      <div className="flex flex-col gap-3">
        <h1 className="w-full truncate text-title-20-bold text-content-primary">{store.name}</h1>

        {/* store-profile-detail(429:17635) — flex-col gap-[12px] */}
        <div className="flex flex-col gap-3">
          {/* store-profile-meta(429:17636) — flex-col gap-[8px] */}
          <div className="flex flex-col gap-2">
            {/* store-profile-address(429:17637) — gap-[4px] items-start · 아이콘 22 · body/14-regular · content/primary */}
            <div className="flex w-full items-start gap-1">
              <FigmaIcon name="map-pin-fill" width={22} className="shrink-0" />
              <p className="min-w-0 flex-1 text-body-14-regular text-content-primary">
                {detail.address}
              </p>
            </div>

            {/*
              store-profile-hours(429:17640) — gap-[4px] items-start · `icon/clock-filled` **22**
              Figma 개발 주석(429:17643): "해당 텍스트박스 클릭시 아래로 영업 시간 상세 정보가 나옴"
              → 접힘/펼침이 상태축이고, chevron 방향이 그걸 나른다.
              ⚠️ v3 프레임 3개는 **전부 펼친 상태(icon/chevron-up 429:17648)**라 접힘 시안이 없다 —
                 chevron-down은 v2 시안(구 364:7897) 근거로 유지한다.
            */}
            <button
              type="button"
              aria-expanded={hoursOpen}
              onClick={() => setHoursOpen((current) => !current)}
              className="flex w-full items-start gap-1 text-left"
            >
              <IconClockFill aria-hidden="true" className="size-5.5 shrink-0 text-content-disabled" />
              <div className="min-w-0 flex-1">
                {/* store-profile-hours-summary(429:17643) — gap-[4px] items-center */}
                <div className="flex items-center gap-1">
                  {/* summary-text(429:17644) — gap-[6px] items-center */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-body-14-semibold text-content-primary">영업종료</span>
                    <span
                      aria-hidden="true"
                      className="size-0.5 shrink-0 rounded-full bg-current text-content-primary"
                    />
                    <span className="whitespace-nowrap text-body-14-regular text-content-primary">
                      10:30에 영업시작
                    </span>
                  </div>
                  <FigmaIcon
                    name={hoursOpen ? "chevron-up" : "chevron-down"}
                    width={12}
                    className="shrink-0"
                  />
                </div>
                {hoursOpen && (
                  /*
                    펼침 상세 `store-profile-hours-detail`(429:17649) 실측 —
                      summary bottom → gap-[6px] · **body/14-medium** · **content/primary**
                      `flex gap-[6px] items-start` 2열: 요일 라벨(w24) + 시간 3줄(w157, h66)
                    개발 주석(429:17550): "상세정보는 텍스트스타일-미듐(조금 굵은 글씨)"
                    (v2 구현은 regular + content/secondary + 4줄 세로 나열이라 셋 다 어긋나 있었다)
                  */
                  <div className="mt-1.5 flex items-start gap-1.5 text-body-14-medium text-content-primary">
                    <p className="shrink-0">{dayLabel}</p>
                    <div className="min-w-0">
                      {timeLines.map((line) => (
                        <p key={line}>{line}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </button>
          </div>

          {/*
            store-profile-stats(429:17652) — gap-[8px] items-center. 실측:
              배지  px-[8px] py-[4px] · radius/sm · gap-[4px]
                    라벨 caption/12-medium + 숫자 caption/12-bold
              1번   bg surface/accent/orange-subtle · text content/accent/badge
              2번   bg surface/brand · text **content/brand/dark**

            ⚠️ 공통 `BadgeStoreStat`을 **쓰지 않는다.** 그 컴포넌트는 라벨·숫자가
               `body-14-medium`/`body-14-bold`(14px)라서 이 자리와 4px 어긋난다 —
               실제로 한 번 재사용했다가 배지 글자가 12→14px로 커지는 회귀를 냈다(리뷰에서 잡힘).
               검산: 인스턴스 높이 25 = caption/12(12×1.45=17.4) + py-4×2 = 25.4 ✅
                                  body/14(14×1.55=21.7) + 8 = 29.7 ✗
               `BadgeStoreStat`에 size 축을 뚫는 건 컴포넌트 규격 변경이라 별도 세션이다.
               그때 이 블록을 `<BadgeStoreStat size="small">`로 되돌린다.
               (인라인 배지의 원래 문제였던 2번 배지 색 `content/brand/light` →
                `content/brand/dark`와 라벨/숫자 굵기 분리는 아래에 반영돼 있다)
          */}
          <div className="flex items-center gap-2">
            <span className="flex shrink-0 items-center gap-1 rounded-sm bg-surface-accent-orange-subtle px-2 py-1 text-content-accent-badge">
              <span className="text-caption-12-medium">저렴한 야채</span>
              <span className="text-caption-12-bold">{store.affordableCount}</span>
            </span>
            <span className="flex shrink-0 items-center gap-1 rounded-sm bg-surface-brand px-2 py-1 text-content-brand-dark">
              <span className="text-caption-12-medium">오늘 제보된 품목</span>
              <span className="text-caption-12-bold">{store.todayReportCount}</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function PriceRow({ item }: { item: StoreDetailPrice }) {
  return (
    <div className="flex min-h-19.25 w-full items-center gap-3">
      <FigmaImage name="onion.png" width={40} height={40} className="size-10 object-contain" />
      <div className="min-w-0 flex-1">
        <p className="text-body-16-semibold text-content-primary">{item.name}</p>
        <p className="text-caption-12-regular text-content-secondary">{item.age}</p>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-body-16-semibold text-content-primary">
          {item.price}<span className="ml-1 text-caption-12-regular text-content-disabled">{item.unit}</span>
        </p>
        <p className="text-caption-12-medium text-trend-down">{item.trend}</p>
      </div>
    </div>
  );
}

function SheetPriceRow({ item }: { item: StoreDetailPrice }) {
  return (
    <div className="flex h-14.5 w-full items-center justify-between border-b border-border-secondary px-2 last:border-b-0">
      <div className="flex w-42 items-center gap-1">
        <ImageVegetableOnion className="size-6" />
        <div className="flex min-w-0 items-center gap-1">
          <p className="truncate text-body-14-medium text-content-primary">{item.name}</p>
          <span aria-hidden="true" className="size-0.5 shrink-0 rounded-full bg-content-disabled" />
          <p className="shrink-0 text-caption-12-medium text-content-disabled">{item.age}</p>
        </div>
      </div>
      <p className="flex w-41 shrink-0 items-center justify-end gap-1 whitespace-nowrap text-body-16-bold text-content-primary">
        {item.price}
        <span className="text-caption-12-regular text-content-disabled">{item.unit}</span>
      </p>
    </div>
  );
}

function PriceSheet({ prices, onClose }: { prices: StoreDetailPrice[]; onClose: () => void }) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="absolute inset-0 z-30 flex items-end bg-overlay-dim" onClick={onClose}>
      <section
        role="dialog"
        aria-modal="true"
        aria-label="제보된 저렴한 야채 목록"
        onClick={(event) => event.stopPropagation()}
        className="flex w-full flex-col items-center gap-4 rounded-t-3xl bg-surface-primary px-4 pt-2 pb-8"
      >
        <SheetHandle />
        <div className="flex w-full flex-col gap-4">
          <div className="flex h-7 items-center justify-between">
            <h2 className="text-title-18-semibold text-content-primary">제보된 저렴한 야채</h2>
            <p className="w-28 text-right text-caption-12-medium text-content-secondary">최근 30일간 · 최신 순</p>
          </div>
          <div className="w-full">
            {prices.slice(0, 5).map((item) => <SheetPriceRow key={item.id} item={item} />)}
          </div>
        </div>
      </section>
    </div>
  );
}

function StorePrices({ prices }: { prices: StoreDetailPrice[] }) {
  const [kind, setKind] = useState<StoreDetailPrice["kind"]>("cheap");
  const [sheetOpen, setSheetOpen] = useState(false);
  const filtered = prices.filter((item) => item.kind === kind);

  return (
    <>
      {/*
        `reported-vegetable-section`(429:17655) 실측 — 섹션·head 모두 flex-col gap-[24px].
        spacer(8) → 24 → 제목행(h25) → 24 → 정렬 토글 → 24 → 목록 → 4 → 더보기
      */}
      <section className="px-4 pt-6 pb-4">
        <div className="flex items-center justify-between">
          {/* 제목 body/16-**semibold**(429:17659) · 우측 caption/12-**medium** w-[112px](429:17660) */}
          <h2 className="text-body-16-semibold text-content-primary">가게에 제보된 야채</h2>
          <p className="w-28 text-right text-caption-12-medium text-content-secondary">최근 30일간 · 최신 순</p>
        </div>
        {/*
          `filter/sort-toggle`(429:17662) 실측 — h44 · bg surface/secondary · p-[2px] ·
          gap-[4px] · radius/md. 세그먼트는 flex-1 · p-[8px] · radius/md · 1px 테두리:
            선택   bg+border **content/selected**(gray/800 #354153) · body/14-semibold · content/inverse
            비선택 bg surface/secondary · border border/secondary · body/14-medium · content/secondary
          v2 구현은 "흰 알약 + shadow-sm + caption/12"였는데 Figma엔 그림자가 없고
          선택 배경이 gray/800이다 — 오늘 신설된 content/selected가 쓰이는 자리가 여기다.
          대비: content/inverse on content/selected 9.89:1 ✅ (선택 상태가 13.51→9.89로 내려가지만
                둘 다 AA 통과라 매핑 오류 신호는 아니다)
        */}
        <div className="mt-6 flex h-11 items-center gap-1 rounded-md bg-surface-secondary p-0.5">
          {(["cheap", "expensive"] as const).map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={kind === value}
              onClick={() => setKind(value)}
              className={`flex min-w-0 flex-1 items-center justify-center rounded-md border p-2 ${kind === value ? "border-content-selected bg-content-selected text-body-14-semibold text-content-inverse" : "border-border-secondary bg-surface-secondary text-body-14-medium text-content-secondary"}`}
            >
              {value === "cheap" ? "저렴해요" : "비싸요"}
            </button>
          ))}
        </div>
        <div className="mt-1 divide-y divide-border-secondary">
          {filtered.slice(0, 4).map((item) => <PriceRow key={item.id} item={item} />)}
          {filtered.length === 0 && <p className="py-12 text-center text-body-14-medium text-content-secondary">아직 제보가 없어요</p>}
        </div>
        {filtered.length > 4 && (
          <button type="button" onClick={() => setSheetOpen(true)} className="mt-2 h-9.5 w-full rounded-md border border-border-primary text-caption-12-semibold text-content-secondary">
            더보기
          </button>
        )}
      </section>
      {sheetOpen && <PriceSheet prices={filtered} onClose={() => setSheetOpen(false)} />}
    </>
  );
}

function toFigmaComment(comment: Comment, index: number): FigmaComment {
  return {
    id: comment.id,
    nickname: comment.nickname,
    rank: "sprout",
    age: "방금 전",
    body: comment.body,
    tone: (["green", "orange", "blue", "gray"] as const)[index % 4],
  };
}

function StoreComments({ storeName }: { storeName: string }) {
  const localComments = useComments(storeName);
  const [value, setValue] = useState("");
  const [visibleCount, setVisibleCount] = useState(COMMENTS_PAGE_SIZE);
  const comments = localComments.map(toFigmaComment);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const body = value.trim();
    if (!body) return;
    addComment({ storeName, nickname: "황유나", body });
    setValue("");
  };

  return (
    <section className="px-4 pt-5 pb-6">
      <h2 className="text-body-16-bold text-content-primary">댓글 {comments.length}</h2>
      <form onSubmit={handleSubmit} className="mt-4 flex h-10 items-center rounded-md bg-surface-secondary px-3">
        <label htmlFor="store-comment" className="sr-only">댓글 입력</label>
        <input id="store-comment" value={value} onChange={(event) => setValue(event.target.value)} placeholder="댓글을 입력하세요" className="min-w-0 flex-1 bg-transparent text-caption-12-medium text-content-primary outline-none placeholder:text-content-disabled" />
        <button type="submit" disabled={!value.trim()} className="rounded-sm bg-action-primary-default px-2 py-1 text-caption-12-semibold text-content-inverse disabled:bg-action-primary-disabled">등록</button>
      </form>
      <div className="mt-1">
        {comments.slice(0, visibleCount).map((comment) => (
          <ItemComment
            key={comment.id}
            nickname={comment.nickname}
            rank={comment.rank}
            age={comment.age}
            body={comment.body}
            profileColor={comment.tone}
          />
        ))}
      </div>
      {visibleCount < comments.length && (
        <button
          type="button"
          onClick={() => setVisibleCount((count) => count + COMMENTS_PAGE_SIZE)}
          className="mt-2 h-9.5 w-full rounded-md bg-surface-secondary text-caption-12-semibold text-content-secondary"
        >
          댓글 더보기
        </button>
      )}
    </section>
  );
}

export function StoreDetailClient({ store, detail, dataSource }: StoreDetailClientProps) {
  const [favorite, setFavorite] = useState(false);

  return (
    <div className="flex h-dvh justify-center overflow-hidden bg-surface-secondary">
      <div className="relative flex h-full min-h-0 w-full max-w-97.5 flex-col overflow-hidden bg-surface-primary">
        <header className="flex h-12.25 shrink-0 items-center border-b border-border-secondary px-1">
          <StoreDetailBackButton />
        </header>
        <main className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain pb-21">
          <StoreDataSourceNotice dataSource={dataSource} />
          <StoreHero imageName={detail.imageName} storeName={store.name} />
          <StoreInformation store={store} detail={detail} />
          <div className="h-2 bg-border-secondary" />
          <StorePrices prices={detail.prices} />
          <div className="h-2 bg-border-secondary" />
          <StoreComments storeName={store.name} />
        </main>
        <footer className="absolute right-0 bottom-0 left-0 z-20 flex h-18.25 items-center gap-4 border-t border-border-secondary bg-surface-primary px-4 pb-[env(safe-area-inset-bottom)]">
          <button type="button" aria-label={favorite ? "가게 찜 해제" : "가게 찜하기"} aria-pressed={favorite} onClick={() => setFavorite((current) => !current)} className="flex w-13 shrink-0 flex-col items-center justify-center text-content-primary">
            <FigmaIcon
              name={favorite ? "heart-fill" : "heart-stroke-bold"}
              width={24}
              currentColor
              className={favorite ? "text-content-accent-favorite" : undefined}
            />
            <span className="text-body-14-medium">999+</span>
          </button>
          <Link
            href={`${ROUTES.report}?store=${encodeURIComponent(store.id)}`}
            className="flex flex-1 items-center justify-center rounded-lg bg-action-primary-default px-7 py-3 text-body-16-semibold text-content-inverse active:bg-action-primary-pressed"
          >
            가게에 제보하기
          </Link>
        </footer>
      </div>
    </div>
  );
}
