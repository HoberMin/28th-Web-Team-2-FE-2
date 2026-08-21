import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPriceVegetableImage, getVegetableIdByName } from "@/app/(tabs)/prices/_images";
import { ApiError } from "@/app/_lib/api/api-error";
import { getAccessToken } from "@/app/_lib/api/auth/session";
import {
  getPublicPriceSeriesWithFallback,
  getRegionItemReportsWithFallback,
} from "@/app/_lib/api/server/item-prices-fallback";
import { getItemDetailWithTemporaryFallback } from "@/app/_lib/api/server/items-fallback";
import { getSelectedRegionId } from "@/app/_lib/api/server/selected-region";
import { FigmaIcon, FigmaImage } from "@/app/_lib/figma-asset";
import { formatWon } from "@/app/_lib/format";
import { getBaselinePrice } from "@/app/_lib/kamis";
import { ROUTES } from "@/app/_lib/routes";
import type { OnlineMall, PricePoint } from "@/app/_lib/types";
import {
  DEFAULT_DISTRICT,
  getNeighborhoodSeedReports,
  getOnlinePrices,
  VEGETABLES,
} from "@/app/_lib/vegetables";
import {
  NeighborhoodPrices,
  OnlinePriceNotice,
  PriceSectionNav,
  PublicPriceChart,
  type PriceDetailReport,
} from "./_price-detail-client";
import { PriceDetailBackButton } from "./_back-button";
import { PriceDetailHeader, PRICE_DETAIL_SCROLL_ID } from "./_detail-header";

interface PriceDetailPageProps {
  params: Promise<{ itemId: string }>;
}

/** 라우트 파라미터는 이제 Spring의 숫자 itemId다(예전 46종 prototype 영문 slug 아님). */
function parseItemId(raw: string): number | null {
  const value = Number(raw);
  return Number.isInteger(value) && value > 0 ? value : null;
}

export async function generateMetadata(): Promise<Metadata> {
  return { title: "야채 시세 상세" };
}

function MissingRegion() {
  return (
    <div className="flex h-dvh items-center justify-center bg-surface-primary px-4 text-center">
      <div>
        <p className="text-title-18-bold text-content-primary">동네 정보가 필요해요</p>
        <p className="mt-2 text-body-14-regular text-content-secondary">
          온보딩에서 동네를 선택하면 시세를 볼 수 있어요.
        </p>
      </div>
    </div>
  );
}

export default async function PriceDetailPage({ params }: PriceDetailPageProps) {
  const { itemId: rawItemId } = await params;
  const itemId = parseItemId(rawItemId);
  if (itemId === null) notFound();

  const [token, regionId] = await Promise.all([getAccessToken(), getSelectedRegionId()]);
  if (!regionId) return <MissingRegion />;

  const { detail, isTemporary } = await getItemDetailWithTemporaryFallback({
    itemId,
    regionId,
    token,
  }).catch((error: unknown) => {
    if (error instanceof ApiError && error.kind === "notFound") notFound();
    throw error;
  });

  // 그래프·동네 제보 목록·온라인가 비교는 아직 Spring에 없어, 이름이 일치하는 46종 더미
  // 카탈로그 항목을 찾아 그 부분만 채운다. slug id 매핑은 _images.ts가 진실 소스다 —
  // 직접 `name ===` 비교하면 라이브 표기("고춧가루-국산")와 더미 표기("고춧가루(국산)")가
  // 갈리는 2종을 놓친다. 매칭 실패(더미에 없는 신규 품목)면 그 섹션들만 건너뛰고
  // 위 요약 카드(API 실데이터)는 그대로 보인다.
  const vegetableId = getVegetableIdByName(detail.itemName);
  const vegetable = vegetableId ? VEGETABLES.find((candidate) => candidate.id === vegetableId) : undefined;

  const baseline = vegetable ? await getBaselinePrice(vegetable.id) : null;
  const reports = vegetable
    ? getNeighborhoodSeedReports(DEFAULT_DISTRICT)
        .filter((report) => report.vegetableId === vegetable.id)
        .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
    : [];
  // 더미 보정에 쓸 기준가 — 실 공공시세가 있으면 그걸, 없으면 그래프와 같은 baseline
  // (=BASE_PRICE)을 쓴다. 온라인가·동네 제보가 더미 둘 다 이 값 하나에 비례시켜서 서로
  // 어긋나지 않게 한다(사용자 지적, 2026-08-21 — "그 더미도 공공시세와 온라인 최저가를
  // 보고 그럴듯하게").
  const anchorPrice = detail.todayPublicPrice ?? baseline?.current ?? undefined;
  const online = vegetable ? getOnlinePrices(vegetable.id, anchorPrice) : undefined;
  const averageWeightNote = vegetable?.id === "cucumber" ? "오이 1개는 평균 200g이에요" : null;
  const dummyDetailReports: PriceDetailReport[] =
    vegetable && baseline
      ? reports.map((report) => {
          const base = anchorPrice ?? baseline.current;
          const scale = baseline.current > 0 ? base / baseline.current : 1;
          const price = round10(report.pricePerKg * scale);
          const diff = price - base;
          return {
            id: report.id,
            reportedAt: Date.parse(report.createdAt),
            place: report.place ?? report.district,
            age: formatAge(report.createdAt, baseline.asOf),
            price,
            unit: vegetable.unit,
            diff,
            diffPercent: base === 0 ? 0 : (diff / base) * 100,
          };
        })
      : [];

  const unit = detail.defaultUnit ?? vegetable?.unit ?? "";
  // 백엔드 itemImageUrl은 안 쓴다 — 시세 탭 전체가 프런트에 모아 둔 46종 사진을 쓰기로
  // 이미 정해져 있고(_images.ts), next.config에 remotePatterns도 없어 원격 URL을 그대로
  // <Image>에 넘기면 렌더 중 throw한다.
  const image = getPriceVegetableImage(detail.itemName);
  const publicPrice = detail.todayPublicPrice ?? null;
  const publicPriceDiff = detail.priceGap ?? 0;
  const publicPriceDiffPercent = detail.priceDiffRate ?? 0;

  // 동네 제보 목록과 가격 추이는 2026-08-21에 Spring 엔드포인트가 생겼다. 다만 DB 적재가
  // 아직이라 정상 200으로 빈 배열이 오는 구간이 있어, 비면 위 46종 더미를 그대로 쓴다
  // (`item-prices-fallback`). 적재가 끝나면 그 파일의 폴백 분기만 걷어내면 된다.
  const [
    { reports: detailReports, isTemporary: reportsAreTemporary },
    { series: publicPriceSeries, isTemporary: seriesIsTemporary },
  ] = await Promise.all([
    getRegionItemReportsWithFallback({
      regionId,
      itemId,
      basePrice: publicPrice,
      unit,
      dummyReports: dummyDetailReports,
    }),
    getPublicPriceSeriesWithFallback({
      itemId,
      regionId,
      dummySeries: baseline?.series ?? null,
    }),
  ]);

  // 요약 카드 "온라인 최저가"도 같은 이유로 손봤다 — 실API가 null이면 방금 만든(공공시세
  // 기준으로 비례 계산한) 추정치로 채우되, 조용히 진짜인 척하지 않도록 "(예시)"를 붙인다.
  const summaryOnlineLowestPrice = detail.onlineLowestPrice ?? online?.cheapest.price ?? undefined;
  // `online.cheapest`가 하필 실측(컬리, `measured: true`)인 드문 경우까지 "(예시)"로
  // 잘못 표시하지 않도록 cheapest 자신의 measured 여부를 본다(`online.hasEstimated`는
  // "세트 안에 추정이 하나라도 있나"라 이 판단엔 너무 거칠다).
  const summaryOnlineLowestIsEstimated =
    detail.onlineLowestPrice == null && online !== undefined && !online.cheapest.measured;

  // "오늘 공공 시세"도 같은 이유로 손봤다 — 실API가 null인데 그래프(`baseline`)는 더미로
  // 그려지면, 요약 카드만 "시세 정보 없음"이라고 해서 바로 아래 그래프가 값을 보여주는
  // 것과 괴리가 생긴다(사용자 지적, 2026-08-21 — "가격 정보가 쓰이는 곳엔 다 들어가야
  // 한다"). `baseline.isFallback`이 true일 때만 추정치를 쓴다 — baseline 자체가 실측
  // (KAMIS)인데 이 품목만 today가 null인 애매한 경우까지 덮어쓰지 않기 위해서다.
  const estimatedPublicPrice =
    publicPrice === null && baseline?.isFallback ? baseline.current : null;
  const summaryPublicPrice = publicPrice ?? estimatedPublicPrice;
  const summaryPublicPriceIsEstimated = estimatedPublicPrice !== null;
  const estimatedPublicPriceTrend = summaryPublicPriceIsEstimated
    ? diffFromSeries(baseline?.series.week ?? [])
    : null;
  const summaryPublicPriceDiff = estimatedPublicPriceTrend?.diff ?? publicPriceDiff;
  const summaryPublicPriceDiffPercent = estimatedPublicPriceTrend?.diffPercent ?? publicPriceDiffPercent;

  // "최근 동네 제보가"도 같은 문제였다 — 요약 카드(`detail.latestLocalReportPrice`)는 실API만
  // 보는데, 바로 아래 "온라인가 비교" 섹션의 같은 라벨은 **더 예전 방식의 별개 더미**
  // (`getNeighborhoodSeedReports`)를 직접 봐서 둘이 서로 다른 값을 보여줄 수 있었다. 이제
  // 막 완성된 `detailReports`(실제 있으면 실제, 없으면 더미 — 위 fallback)로 두 자리를 통일한다.
  const latestDetailReport = detailReports[0];
  const summaryLatestReportPrice = detail.latestLocalReportPrice ?? latestDetailReport?.price;
  // `reportsAreTemporary`까지 같이 본다 — 요약 API만 null이고 제보 목록 API는 실제로 뭔가를
  // 찾은 드문 경우(두 실API끼리의 불일치)까지 "(예시)"로 잘못 표시하지 않기 위해서다.
  const summaryLatestReportIsEstimated =
    detail.latestLocalReportPrice == null && latestDetailReport !== undefined && reportsAreTemporary;

  return (
    <div className="flex h-dvh justify-center overflow-hidden bg-surface-secondary">
      {/* relative: 헤더가 본문 위에 겹쳐 뜬다(스크롤 전에는 헤더 자체가 감춰져 있다). */}
      <div className="relative flex h-full min-h-0 w-full max-w-97.5 flex-col overflow-hidden bg-surface-primary">
        <PriceDetailHeader
          backButton={<PriceDetailBackButton />}
          title={
            <>
              <p className="truncate text-body-16-semibold text-content-primary">
                {detail.itemName} {unit}
              </p>
              {isTemporary ? (
                <span
                  role="status"
                  data-data-source="temporary"
                  className="shrink-0 rounded-full bg-surface-accent-orange-subtle px-2 py-0.5 text-caption-12-medium text-content-accent-badge"
                >
                  예시 데이터
                </span>
              ) : null}
            </>
          }
        />
        {/*
          상단 패딩을 두지 않는다 — Figma [660:14777]은 상태바 바로 아래에서 썸네일이 시작한다.
          헤더는 스크롤을 시작해야 나타나고, 그때는 본문 위에 겹쳐 뜬다(absolute).
        */}
        <main
          id={PRICE_DETAIL_SCROLL_ID}
          className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain"
        >
          <h1 className="sr-only">{detail.itemName} 야채 시세 상세</h1>
          <PriceSummary
            name={detail.itemName}
            unit={unit}
            image={image}
            latestReportPrice={summaryLatestReportPrice}
            latestReportPriceIsEstimated={summaryLatestReportIsEstimated}
            publicPrice={summaryPublicPrice}
            publicPriceIsEstimated={summaryPublicPriceIsEstimated}
            onlineLowestPrice={summaryOnlineLowestPrice}
            onlineLowestPriceIsEstimated={summaryOnlineLowestIsEstimated}
            publicPriceDiff={summaryPublicPriceDiff}
            publicPriceDiffPercent={summaryPublicPriceDiffPercent}
          />
          <div className="h-2 bg-border-secondary" />
          <PriceSectionNav />

          <NeighborhoodPrices reports={detailReports} />
          <div className="h-2 bg-border-secondary" />
          {publicPriceSeries ? <PublicPriceChart series={publicPriceSeries} /> : null}
          <div className="h-2 bg-border-secondary" />

          <section id="online-prices" className="scroll-mt-23.25 px-4 py-8">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between rounded-md border border-border-primary p-3">
                <span className="text-body-14-medium text-content-secondary">최근 동네 제보가</span>
                <p className="flex items-center gap-1">
                  <span className="text-body-14-medium text-content-secondary">
                    {summaryLatestReportPrice === undefined
                      ? "제보 없음"
                      : `${formatWon(summaryLatestReportPrice)}${summaryLatestReportIsEstimated ? " (예시)" : ""}`}
                  </span>
                  <span className="text-caption-12-regular text-content-disabled">/{unit}</span>
                </p>
              </div>
              {averageWeightNote ? (
                <div className="flex items-center justify-center gap-1 rounded-md bg-surface-brand px-3 py-2 text-content-brand-light">
                  <FigmaIcon name="information-circle" width={16} />
                  <p className="text-body-14-medium">{averageWeightNote}</p>
                </div>
              ) : null}
            </div>
            <OnlinePriceNotice />
            <div className="mt-2 flex flex-col gap-2">
              <ul>
                {online?.prices.map((price) => {
                  const comparison =
                    summaryLatestReportPrice !== undefined ? price.price - summaryLatestReportPrice : null;
                  return (
                    <li key={price.mall} className="border-b border-border-secondary py-4 last:border-b-0">
                      <div className="flex items-center justify-between">
                        {/*
                          Figma `row/online-price`(1271:23074) 실측 — 좌측은 gap-[8px] hug다.
                          고정 폭 `w-[102px]`가 박혀 있었는데(2026-08-21 제거) 시안에 없는 값이고
                          「GS SHOP」처럼 긴 이름이 102px에서 잘렸다.
                          부가정보 구분자도 시안은 `·` 글자가 아니라 **2px 원형 도트**다
                          (같은 화면의 시트 행은 이미 도트를 쓰고 있어 한 화면 안에서 갈려 있었다).
                        */}
                        <div className="flex min-w-0 items-center gap-2">
                          <MallLogo mall={price.mall} />
                          <div className="min-w-0">
                            <p className="truncate text-body-16-medium text-content-primary">{price.mall}</p>
                            <p className="flex min-w-0 items-center gap-1 text-caption-12-medium text-content-disabled">
                              <span className="truncate">{price.channel}</span>
                              {price.channelNote ? (
                                <>
                                  <span
                                    aria-hidden="true"
                                    className="size-0.5 shrink-0 rounded-full bg-current"
                                  />
                                  <span className="truncate">{price.channelNote}</span>
                                </>
                              ) : null}
                            </p>
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="flex items-center justify-end gap-1">
                            <strong className="text-body-16-bold text-content-primary">{formatWon(price.price)}</strong>
                            <span className="text-caption-12-regular text-content-disabled">/{unit}</span>
                          </p>
                          <p className={`text-caption-12-medium ${comparison !== null && comparison < 0 ? "text-trend-down" : "text-content-disabled"}`}>
                            {comparison === null
                              ? "동네 제보가와 비교할 수 없어요"
                              : comparison < 0
                                ? "최근 동네 제보가보다 저렴해요!"
                                : comparison === 0
                                  ? "최근 동네 제보가와 같아요"
                                  : "동네 제보가보다 비싸요"}
                          </p>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </section>
        </main>

        <footer className="shrink-0 border-t border-border-secondary bg-surface-primary px-4 py-3" style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}>
          <Link
            href={vegetable ? `${ROUTES.report}?item=${vegetable.id}` : ROUTES.report}
            // UI QA 2026-08-20 #32: 이 CTA는 action-secondary가 아니라 action-primary/default다.
            className="flex w-full items-center justify-center rounded-lg bg-action-primary-default px-7 py-3 text-body-16-semibold text-content-inverse active:bg-action-primary-pressed"
          >
            우리 동네 가격 제보하기
          </Link>
        </footer>
      </div>
    </div>
  );
}

interface PriceSummaryProps {
  name: string;
  unit: string;
  image?: string;
  latestReportPrice?: number;
  /** `latestReportPrice`가 실API가 아니라 예시(더미) 추정치로 채워졌는지(2026-08-21). */
  latestReportPriceIsEstimated?: boolean;
  /** 계절 품목 등 기준일 공공가격이 없으면 `null` — "0원"으로 단정하지 않는다. */
  publicPrice: number | null;
  /** `publicPrice`가 실API가 아니라 예시(더미) 추정치로 채워졌는지(2026-08-21). */
  publicPriceIsEstimated?: boolean;
  /**
   * 온라인 최저가. 화면GUI(원본) 364:7185 `public-price-row` — **이 행이 코드에 빠져 있었다.**
   * Figma의 `public-price-group`은 공공 시세 · 온라인 최저가 · 어제 대비 **3행**이다.
   */
  onlineLowestPrice?: number;
  /** `onlineLowestPrice`가 실API가 아니라 예시(더미) 추정치로 채워졌는지(2026-08-21). */
  onlineLowestPriceIsEstimated?: boolean;
  publicPriceDiff: number;
  publicPriceDiffPercent: number;
}

function PriceSummary({
  name,
  unit,
  image,
  latestReportPrice,
  latestReportPriceIsEstimated,
  publicPrice,
  publicPriceIsEstimated,
  onlineLowestPrice,
  onlineLowestPriceIsEstimated,
  publicPriceDiff,
  publicPriceDiffPercent,
}: PriceSummaryProps) {
  const direction = publicPriceDiff < 0 ? "down" : publicPriceDiff > 0 ? "up" : "flat";

  return (
    <section aria-label={`${name} 가격 요약`} className="flex gap-5 px-4 pt-6 pb-7.75">
      <div className="relative size-31 shrink-0 overflow-hidden rounded-xl border border-border-img bg-background-secondary">
        {image ? (
          <Image src={image} alt={name} fill sizes="124px" className="object-cover" priority />
        ) : (
          <span className="flex size-full items-center justify-center text-5xl" aria-hidden="true">
            🥬
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1 whitespace-nowrap text-content-primary">
          <strong className="text-title-20-bold">{name}</strong>
          <span className="text-title-18-medium">{unit}</span>
        </p>
        <div className="mt-0.5 flex items-center justify-between border-b border-border-secondary py-2">
          <span className="text-body-16-medium text-content-secondary">최근 동네 제보가</span>
          <strong className="text-title-18-semibold text-content-primary">
            {latestReportPrice === undefined
              ? "제보 없음"
              : `${formatWon(latestReportPrice)}${latestReportPriceIsEstimated ? " (예시)" : ""}`}
          </strong>
        </div>
        <div className="mt-2 flex flex-col gap-0.5">
          <p className="flex items-center justify-between">
            <span className="text-caption-12-medium text-content-disabled">오늘 공공 시세</span>
            <span className="text-body-14-medium text-content-secondary">
              {publicPrice === null
                ? "시세 정보 없음"
                : `${formatWon(publicPrice)}${publicPriceIsEstimated ? " (예시)" : ""}`}
            </span>
          </p>
          {/*
            화면GUI(원본) 364:7185 — 공공 시세와 같은 형식의 두 번째 행이다.
            UI QA 2026-08-20 #27 "store-summary에 '온라인 최저가' 없음 → 온라인 최저가 제시":
            전에는 값이 없으면 **행 자체를 지웠는데**, Spring이 `onlineLowestPrice`를 null로
            주는 품목이 많아 실제 화면에서 이 줄이 통째로 사라져 있었다. 바로 위 "오늘 공공 시세"가
            값이 없을 때 "시세 정보 없음"을 보여주는 것과 처리를 맞춘다 — 줄이 사라지면 요약 카드의
            항목 수가 품목마다 달라져 세로 리듬도 흔들린다.
          */}
          <p className="flex items-center justify-between">
            <span className="text-caption-12-medium text-content-disabled">온라인 최저가</span>
            <span className="text-body-14-medium text-content-secondary">
              {onlineLowestPrice === undefined
                ? "가격 정보 없음"
                : `${formatWon(onlineLowestPrice)}${onlineLowestPriceIsEstimated ? " (예시)" : ""}`}
            </span>
          </p>
          {/* 364:7188 `price-trend-row` — 위 두 행과 달리 **py-[2px]** 이 붙어 있다. */}
          <p className="flex items-center justify-between py-0.5">
            <span className="text-caption-12-medium text-content-disabled">어제 대비</span>
            {direction === "flat" ? (
              <span className="text-caption-12-medium text-trend-flat">변동 없음</span>
            ) : (
              <span className={`flex items-center text-caption-12-medium ${direction === "down" ? "text-trend-down" : "text-trend-up"}`}>
                <FigmaIcon name={`trend-${direction}`} width={16} />
                {formatWon(Math.abs(publicPriceDiff))}({publicPriceDiffPercent > 0 ? "+" : "-"}{Math.abs(publicPriceDiffPercent).toFixed(1)}%)
              </span>
            )}
          </p>
        </div>
      </div>
    </section>
  );
}

const MALL_IMAGE: Record<OnlineMall, string> = {
  컬리: "online-kurly.png",
  오아시스: "online-oasis.png",
  "GS SHOP": "online-gs-shop.png",
  "11번가": "online-11st.png",
};

function MallLogo({ mall }: { mall: OnlineMall }) {
  return (
    <FigmaImage
      name={MALL_IMAGE[mall]}
      width={48}
      height={48}
      className="size-12 shrink-0 rounded-full"
    />
  );
}

function formatAge(createdAt: string, asOf: string): string {
  const days = Math.max(
    0,
    Math.floor((Date.parse(`${asOf}T00:00:00Z`) - Date.parse(`${createdAt.slice(0, 10)}T00:00:00Z`)) / 86_400_000),
  );
  if (days === 0) return "오늘";
  if (days === 1) return "어제";
  return `${days}일 전`;
}

function round10(n: number): number {
  return Math.round(n / 10) * 10;
}

/** 시계열의 마지막 두 포인트로 "어제 대비"를 구한다 — 요약 카드가 더미 그래프와 같은 값을 쓰게. */
function diffFromSeries(points: PricePoint[]): { diff: number; diffPercent: number } {
  if (points.length < 2) return { diff: 0, diffPercent: 0 };
  const today = points[points.length - 1].price;
  const yesterday = points[points.length - 2].price;
  const diff = today - yesterday;
  return { diff, diffPercent: yesterday === 0 ? 0 : (diff / yesterday) * 100 };
}
