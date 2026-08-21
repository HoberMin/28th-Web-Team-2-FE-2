"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useOptimistic, useState, useTransition } from "react";
import IconClockFill from "@karrotmarket/react-monochrome-icon/IconClockFill";
import IconPictureFill from "@karrotmarket/react-monochrome-icon/IconPictureFill";
import { BadgeReporterRank } from "@/app/_components/badge-reporter-rank";
import { TemporaryDataBadge } from "@/app/_components/temporary-data-badge";
import { ImageProfileReporter } from "@/app/_components/image-profile-reporter";
import { ImageStorePlaceholder } from "@/app/_components/image-store-placeholder";
import { HomeVegetableImage } from "@/app/(tabs)/_home/home-vegetable-image";
import { SheetHandle } from "@/app/_components/sheet-handle";
import { updateStoreFavorite } from "@/app/_lib/api/actions/store-favorite";
import { FigmaIcon } from "@/app/_lib/figma-asset";
import { buildExistingStoreReportHref } from "@/app/report/_lib/report-entry-query";
import { StoreDetailBackButton } from "./_back-button";
import type { StoreDetailPrice, StoreDetailPriceTrend, StoreDetailProfile } from "./_data";

interface StoreDetailClientProps {
  storeId: number;
  profile: StoreDetailProfile;
  prices: StoreDetailPrice[];
  /** `GET /stores/{id}/reports`의 summary. 배지 숫자가 이 값이다. */
  cheapCount: number;
  expensiveCount: number;
  reportsAreTemporary?: boolean;
  /** `GET /stores/{id}`의 `favoriteCount`. 응답에 없으면 하트 아래 숫자를 그리지 않는다. */
  favoriteCount?: number;
}

function StoreHero({ imageUrl, storeName }: { imageUrl?: string; storeName: string }) {
  // 가게 사진은 API가 주는 URL뿐이다 — 없으면 Figma placeholder를 그린다.
  // (예전엔 `store-detail-hero.png`라는 Figma 시안 에셋을 특정 가게에 박아 두었다.)
  if (!imageUrl) return <ImageStorePlaceholder />;

  return (
    <Image
      src={imageUrl}
      alt={`${storeName} 가게 전경`}
      width={390}
      height={220}
      unoptimized
      className="h-55 w-full object-cover"
    />
  );
}

function StoreInformation({
  profile,
  cheapCount,
  expensiveCount,
}: Pick<StoreDetailClientProps, "profile" | "cheapCount" | "expensiveCount">) {
  const [hoursOpen, setHoursOpen] = useState(true);
  const hasHours = Boolean(profile.hours);

  return (
    // 화면GUI(원본) `F03_가게상세` 429:17633 `store-profile-info` 실측(2026-08-19 v3).
    // 사진 bottom 220 → info y240 = pt-20. body가 flex-col gap-[28px]이라 아래로 pb-7(28px).
    <section className="px-4 pt-5 pb-7">
      {/* store-profile-info — flex-col gap-[12px] */}
      <div className="flex flex-col gap-3">
        <h1 className="w-full truncate text-title-20-bold text-content-primary">
          {profile.name ?? "가게"}
        </h1>

        {/* store-profile-detail(429:17635) — flex-col gap-[12px] */}
        <div className="flex flex-col gap-3">
          {/* store-profile-meta(429:17636) — flex-col gap-[8px] */}
          <div className="flex flex-col gap-2">
            {/*
              store-profile-address(429:17637) — gap-[4px] items-start · 아이콘 22 ·
              body/14-regular · content/primary.
              주소는 `GET /stores/{storeId}`의 `address`다. 그것도 쿼리 폴백도 비면
              **줄 자체를 그리지 않는다**(예시 주소로 채우지 않는다).
            */}
            {profile.address ? (
              <div className="flex w-full items-start gap-1">
                <FigmaIcon name="map-pin-fill" width={22} className="shrink-0" />
                <p className="min-w-0 flex-1 text-body-14-regular text-content-primary">
                  {profile.address}
                </p>
              </div>
            ) : null}

            {/*
              store-profile-hours(429:17640) — gap-[4px] items-start · `icon/clock-filled` **22**
              Figma 개발 주석(429:17643): "해당 텍스트박스 클릭시 아래로 영업 시간 상세 정보가 나옴"
              → 접힘/펼침이 상태축이고, chevron 방향이 그걸 나른다.
              ⚠️ v3 프레임 3개는 **전부 펼친 상태(icon/chevron-up 429:17648)**라 접힘 시안이 없다 —
                 chevron-down은 v2 시안(구 364:7897) 근거로 유지한다.
              ⚠️ 상세 응답의 `businessHours`는 요일별 문자열 배열인데 **지금 라이브는 빈 배열**
                 이라 실질적으로는 `favorite-stores`의 **오늘 영업시간 한 줄**(`todayBusinessHours`)
                 폴백만 들어온다 — 그래서 펼침 상세도 그 한 줄이다. 값이 차면 배열째 그린다.
                 시안의 3줄(브레이크타임·라스트오더)은 계약이 생기면 채운다.
            */}
            {hasHours ? (
              <button
                type="button"
                aria-expanded={hoursOpen}
                onClick={() => setHoursOpen((current) => !current)}
                className="flex w-full items-start gap-1 text-left"
              >
                <IconClockFill
                  aria-hidden="true"
                  className="size-5.5 shrink-0 text-content-disabled"
                />
                <div className="min-w-0 flex-1">
                  {/* store-profile-hours-summary(429:17643) — gap-[4px] items-center */}
                  <div className="flex items-center gap-1">
                    {/* summary-text(429:17644) — gap-[6px] items-center */}
                    <div className="flex min-w-0 items-center gap-1.5">
                      {profile.openLabel ? (
                        <>
                          <span className="shrink-0 text-body-14-semibold text-content-primary">
                            {profile.openLabel}
                          </span>
                          <span
                            aria-hidden="true"
                            className="size-0.5 shrink-0 rounded-full bg-current text-content-primary"
                          />
                        </>
                      ) : null}
                      <span className="min-w-0 truncate text-body-14-regular text-content-primary">
                        {profile.hours}
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
                        gap-[6px] · **body/14-medium** · **content/primary**
                      개발 주석(429:17550): "상세정보는 텍스트스타일-미듐(조금 굵은 글씨)"
                    */
                    <p className="mt-1.5 text-body-14-medium text-content-primary">
                      오늘 {profile.hours}
                    </p>
                  )}
                </div>
              </button>
            ) : null}
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

            ⚠️ **2번 배지의 라벨이 바뀌었다** (2026-08-20). 시안은 "오늘 제보된 품목"인데
               `GET /stores/{id}/reports`의 summary가 주는 건 `cheapCount`/`expensiveCount`
               두 개뿐이라 "오늘"을 셀 수 없다. 없는 값을 더미로 채우는 대신 **응답에 실제로
               있는 값**(비싼 야채 수)으로 바꿨다. 계약이 생기면 시안 문구로 되돌린다.
          */}
          <div className="flex items-center gap-2">
            <span className="flex shrink-0 items-center gap-1 rounded-sm bg-surface-accent-orange-subtle px-2 py-1 text-content-accent-badge">
              <span className="text-caption-12-medium">저렴한 야채</span>
              <span className="text-caption-12-bold">{cheapCount}</span>
            </span>
            <span className="flex shrink-0 items-center gap-1 rounded-sm bg-surface-brand px-2 py-1 text-content-brand-dark">
              <span className="text-caption-12-medium">비싼 야채</span>
              <span className="text-caption-12-bold">{expensiveCount}</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * 제보 사진(80×80).
 *
 * **서버가 주는 `itemImageUrl`만 쓴다.** 이 자리는 Figma에서 제보자가 찍어 올린 사진이라
 * (`row/saved` `Photo=default`) 로컬 일러스트로 대신할 수 있는 값이 아니다 — 예전에는 URL이
 * 없을 때 품목명으로 `HomeVegetableImage`의 46종 벡터를 찾아 그렸는데, 그러면 실제로 사진이
 * 없는 제보가 사진이 있는 것처럼 보였다(2026-08-21 제거).
 *
 * 없을 때는 Figma `image/vegetable-placeholder`(`Photo=placeholer` variant, 1096:21559):
 * `surface/secondary` 바탕 + 가운데 사진 아이콘 32.
 *
 * ⚠️ 아이콘은 Figma 원본(`material-symbols:photo-rounded`)을 아직 못 받았다 — 같은 파일이
 *    `icon/clock-filled` 자리에 쓰고 있는 karrot 모노크롬 아이콘으로 대신한다.
 *    아이콘 일괄 교체 때 원본으로 바꾼다.
 */
function ReportPhoto({ item }: { item: StoreDetailPrice }) {
  if (item.imageUrl) {
    return (
      <Image
        src={item.imageUrl}
        alt={`${item.name} 제보 사진`}
        width={80}
        height={80}
        unoptimized
        className="size-20 shrink-0 rounded-md object-cover"
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className="flex size-20 shrink-0 items-center justify-center rounded-md bg-surface-secondary text-content-disabled"
    >
      <IconPictureFill className="size-8" />
    </span>
  );
}

/**
 * 시트 안의 작은 품목 그림(24×24).
 *
 * 여기는 위와 달리 **Figma가 `image/vegetable-*` 일러스트를 쓰는 자리**라
 * (`row/saved type=vegetable-compact`), 서버 사진이 없으면 품목명으로 벡터를 찾는다.
 */
function PriceItemThumbnail({ item }: { item: StoreDetailPrice }) {
  if (item.imageUrl) {
    return (
      <Image
        src={item.imageUrl}
        alt={`${item.name} 이미지`}
        width={24}
        height={24}
        unoptimized
        className="size-full object-contain"
      />
    );
  }
  return <HomeVegetableImage name={item.name} size={40} />;
}

/** Figma `text/vegetable-trend` — 화살표가 글자가 아니라 `icon/trend-*` 16px SVG다. */
function PriceTrend({ trend }: { trend: StoreDetailPriceTrend }) {
  return (
    <span
      className={`flex items-center justify-end whitespace-nowrap text-caption-12-medium ${
        trend.direction === "down" ? "text-trend-down" : "text-trend-up"
      }`}
    >
      <FigmaIcon name={`trend-${trend.direction}`} width={16} currentColor className="shrink-0" />
      <span>{trend.amount}</span>
      <span>{trend.percent}</span>
    </span>
  );
}

/**
 * 가게에 제보된 야채 한 행 — Figma `row/saved` `type=photo`
 * ([1096:19281](https://www.figma.com/design/WfW1Nkx1oiOWBHNwrw48IL/Design-Library?node-id=1096-19281)).
 *
 * get_design_context 실측 (2026-08-21):
 *   루트    flex-col items-start (높이 133은 hug)
 *   ① 제보자 줄  flex gap-[8px] items-center
 *        avatar/reporter **24** (avatar/profile 24 + 사람 벡터) → `ImageProfileReporter size={24}`
 *        + gap-[6px]: 닉네임 **body/14-bold** content/primary + badge/reporter-rank
 *   ② 본문  border-b **border/primary** · flex items-start justify-between
 *          **pt-[12px] pb-[16px] pr-[8px]**
 *        좌 flex-1 gap-[16px] items-center
 *             사진 **80×80** radius 8.658(≈radius/md)
 *             정보 py-[8px]: 이름 body/16-semibold + "3일 전" **caption/12-medium content/disabled**
 *        우 w-[164px] flex-col items-end justify-center gap-[2px]
 *             text/vegetable-price: 가격 **body/16-bold** + 단위 caption/12-regular max-w-[36px]
 *             text/vegetable-trend: icon 16 + 값 caption/12-medium
 *
 * ⚠️ 2026-08-21 이전 구현은 **다른 규격이었다** — 한 줄 77px에 사진 40px, 가격이
 *    body/16-semibold, 추세 화살표가 `▼` 글자였고 제보자 줄이 통째로 없었다.
 *
 * ⚠️ 제보자 정보는 **백엔드가 아직 주지 않는다**(`StoreReportResponse`에 필드 없음).
 *    자리를 지우지 않고 "제보자 정보 없음"을 그린다 — 지우면 행 높이가 시안과 달라지고,
 *    무엇이 비어 있는지가 화면에서 안 보인다. 계약은 `be-요청-2026-08-21-가게상세-제보행.md` 1번.
 */
function PriceRow({ item }: { item: StoreDetailPrice }) {
  return (
    <div className="flex w-full flex-col items-start">
      <div className="flex w-full items-center gap-2">
        {item.reporter ? (
          <>
            <ImageProfileReporter
              size={24}
              color={item.reporter.color ?? "green"}
              className="rounded-full"
            />
            <span className="flex min-w-0 items-center gap-1.5">
              <span className="truncate text-body-14-bold text-content-primary">
                {item.reporter.nickname}
              </span>
              {item.reporter.rank ? <BadgeReporterRank rank={item.reporter.rank} /> : null}
            </span>
          </>
        ) : (
          <span className="text-body-14-medium text-content-disabled">제보자 정보 없음</span>
        )}
      </div>

      <div className="flex w-full items-start justify-between border-b border-border-primary pt-3 pr-2 pb-4">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <ReportPhoto item={item} />
          <div className="flex min-w-0 flex-1 items-start justify-between py-2">
            <div className="flex min-w-0 flex-col justify-center gap-0.5">
              <p className="truncate text-body-16-semibold text-content-primary">{item.name}</p>
              <p className="text-caption-12-medium text-content-disabled">{item.age}</p>
            </div>
            <div className="flex w-41 shrink-0 flex-col items-end justify-center gap-0.5">
              <p className="flex items-center justify-end gap-1 whitespace-nowrap">
                <span className="text-body-16-bold text-content-primary">{item.price}</span>
                <span className="max-w-9 text-caption-12-regular text-content-disabled">
                  {item.unit}
                </span>
              </p>
              {item.trend ? <PriceTrend trend={item.trend} /> : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SheetPriceRow({ item }: { item: StoreDetailPrice }) {
  return (
    <div className="flex h-14.5 w-full items-center justify-between border-b border-border-secondary px-2 last:border-b-0">
      <div className="flex w-42 items-center gap-1">
        <span className="size-6 shrink-0">
          <PriceItemThumbnail item={item} />
        </span>
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

function PriceSheet({
  prices,
  kind,
  onClose,
}: {
  prices: StoreDetailPrice[];
  kind: StoreDetailPrice["kind"];
  onClose: () => void;
}) {
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
        aria-label={kind === "cheap" ? "제보된 저렴한 야채 목록" : "제보된 비싼 야채 목록"}
        onClick={(event) => event.stopPropagation()}
        className="flex max-h-[80%] w-full flex-col items-center gap-4 rounded-t-3xl bg-surface-primary px-4 pt-2 pb-8"
      >
        <SheetHandle />
        <div className="flex min-h-0 w-full flex-col gap-4">
          <div className="flex h-7 items-center justify-between">
            <h2 className="text-title-18-semibold text-content-primary">
              {kind === "cheap" ? "제보된 저렴한 야채" : "제보된 비싼 야채"}
            </h2>
            <p className="w-28 text-right text-caption-12-medium text-content-secondary">최근 30일간 · 최신 순</p>
          </div>
          <div className="w-full min-h-0 overflow-y-auto overscroll-contain">
            {/*
              Figma는 시트 최대 높이를 정의하고 "초과하면 리스트 영역만 스크롤"이라고 적어 두었다
              (`동네제보가 더보기_바텀시트 최대높이`). 더미 시절엔 5개로 잘랐는데, 실데이터에서
              자르면 「더보기」를 눌러도 안 보이는 제보가 생긴다 — 전부 그리고 넘치면 스크롤한다.
            */}
            {prices.map((item) => (
              <SheetPriceRow key={item.id} item={item} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function StorePrices({ prices, isTemporary }: { prices: StoreDetailPrice[]; isTemporary?: boolean }) {
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
          <div className="flex min-w-0 items-center gap-2">
            <h2 className="text-body-16-semibold text-content-primary">가게에 제보된 야채</h2>
            {isTemporary ? <TemporaryDataBadge /> : null}
          </div>
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
        {/*
          `reported-vegetable-list`(1096:18780) 실측 — 행이 y 0 · 149 · 299 · 448에 놓이고
          각 행 높이가 133이라 **행 사이 간격이 16**이다. 구분선은 컨테이너의 divide가 아니라
          `row/saved` 안쪽의 `border-b border/primary`다(마지막 행에도 있다) —
          `divide-y`로는 마지막 행 선이 빠지고 간격도 0이 된다(2026-08-21 수정).
        */}
        <div className="mt-6 flex flex-col gap-4">
          {filtered.slice(0, 4).map((item) => <PriceRow key={item.id} item={item} />)}
          {filtered.length === 0 && <p className="py-12 text-center text-body-14-medium text-content-secondary">아직 제보가 없어요</p>}
        </div>
        {filtered.length > 4 && (
          // `button/base`(429:17669) — bg surface/primary · border border/primary · px-[20px]
          // py-[8px] · radius/md · **body/14-medium** · content/secondary (h38)
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className="mt-1 flex w-full items-center justify-center rounded-md border border-border-primary bg-surface-primary px-5 py-2 text-body-14-medium text-content-secondary"
          >
            더보기
          </button>
        )}
      </section>
      {sheetOpen && (
        <PriceSheet prices={filtered} kind={kind} onClose={() => setSheetOpen(false)} />
      )}
    </>
  );
}

export function StoreDetailClient({
  storeId,
  profile,
  prices,
  cheapCount,
  expensiveCount,
  favoriteCount,
  reportsAreTemporary,
}: StoreDetailClientProps) {
  const router = useRouter();
  const [favoriteError, setFavoriteError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  /**
   * 단골 상태·수는 **서버가 준 값이 기준**이고 토글 중에만 낙관적으로 앞서 나간다.
   * `useState` 초기값으로 복사하지 않는 이유: 토글 성공 뒤 `router.refresh()`가 새 값을
   * 실어 오는데, 복사본은 그걸 받을 수단이 없어 추정치가 화면에 남는다(단골 **수**는 남이
   * 함께 누르는 공유 값이라 어긋나면 그대로 굳는다). 실패하면 transition이 끝나면서
   * 서버 값으로 자동 복귀한다 — 되돌리기 산술을 따로 두지 않는다.
   *
   * 토글은 로그인 사용자만 할 수 있고 그 경로의 상세 조회는 `no-store`라
   * (`server/stores.ts#getStoreDetail`) refresh가 실제로 최신 수를 가져온다.
   */
  const [favoriteView, applyFavorite] = useOptimistic(
    { liked: profile.liked, count: favoriteCount },
    (current, liked: boolean) => ({
      liked,
      count: current.count === undefined ? undefined : Math.max(0, current.count + (liked ? 1 : -1)),
    }),
  );
  const favorite = favoriteView.liked;

  function handleToggleFavorite() {
    const next = !favorite;
    setFavoriteError(null);

    startTransition(async () => {
      applyFavorite(next);
      const result = await updateStoreFavorite(storeId, next);
      if (result.status === "success") {
        router.refresh();
        return;
      }
      setFavoriteError(result.message);
    });
  }

  return (
    <div className="flex h-dvh justify-center overflow-hidden bg-surface-secondary">
      <div className="relative flex h-full min-h-0 w-full max-w-97.5 flex-col overflow-hidden bg-surface-primary">
        <header className="flex h-12.25 shrink-0 items-center border-b border-border-secondary px-1">
          <StoreDetailBackButton />
        </header>
        <main className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain pb-21">
          <StoreHero imageUrl={profile.imageUrl} storeName={profile.name ?? "가게"} />
          <StoreInformation
            profile={profile}
            cheapCount={cheapCount}
            expensiveCount={expensiveCount}
          />
          <div className="h-2 bg-border-secondary" />
        <StorePrices prices={prices} isTemporary={reportsAreTemporary} />
          <div className="h-2 bg-border-secondary" />
        </main>
        {/*
          `section/cta`(429:17672) — h73(py-[12px]) · border-t **border/primary** · 하트 w52 + CTA w300.
          안쪽 폭이 358이라 둘 사이 간격은 6px다(v2 구현은 gap-4=16px였다).
          ⚠️ Figma가 이 프레임에 px-[20px]를 선언해 두었는데 안쪽 폭 358은 px-16이라야 나온다
             (390-32=358 ≠ 390-40=350) — 원본 자체가 어긋나 있어 px-4를 유지했다.
          하트 아래 숫자는 `favoriteCount`다(`caption/12-semibold`). 시안의 "999+"는 상한 표기라
          1000 이상은 그렇게 줄인다. 2026-08-21에 `GET /stores/{id}`가 이 필드를 주기 시작해
          되살렸다 — 그전에는 값이 없어 "단골"/"단골 등록" 문구를 대신 넣어 뒀다.
        */}
        <footer className="absolute right-0 bottom-0 left-0 z-20 flex h-18.25 items-center gap-1.5 border-t border-border-primary bg-surface-primary px-4 pb-[env(safe-area-inset-bottom)]">
          {favoriteError ? (
            <p role="alert" className="sr-only">
              {favoriteError}
            </p>
          ) : null}
          <button
            type="button"
            aria-label={
              // 버튼 안 텍스트(단골 수)는 aria-label에 덮이므로 라벨에 직접 넣는다 —
              // 숫자가 시각 사용자에게만 보이는 정보가 되지 않게.
              favoriteView.count === undefined
                ? favorite
                  ? "단골 해제"
                  : "단골로 등록"
                : `단골 ${favoriteView.count.toLocaleString("ko-KR")}명, ${favorite ? "단골 해제" : "단골로 등록"}`
            }
            aria-pressed={favorite}
            onClick={handleToggleFavorite}
            className="flex w-13 shrink-0 flex-col items-center justify-center text-content-primary"
          >
            <FigmaIcon
              name={favorite ? "heart-fill" : "heart-stroke-bold"}
              width={24}
              currentColor
              className={favorite ? "text-content-accent-favorite" : undefined}
            />
            {favoriteView.count === undefined ? (
              <span className="text-body-14-medium">{favorite ? "단골" : "단골 등록"}</span>
            ) : (
              <span aria-hidden="true" className="text-caption-12-semibold">
                {favoriteView.count > 999 ? "999+" : favoriteView.count.toLocaleString("ko-KR")}
              </span>
            )}
          </button>
          <Link
            href={buildExistingStoreReportHref({
              storeId,
              placeName: profile.name ?? "가게",
              addressName: profile.address ?? "",
            })}
            className="flex flex-1 items-center justify-center rounded-lg bg-action-primary-default px-7 py-3 text-body-16-semibold text-content-inverse active:bg-action-primary-pressed"
          >
            가게에 제보하기
          </Link>
        </footer>
      </div>
    </div>
  );
}
