"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ActionButton } from "seed-design/ui/action-button";
import { SegmentedControl, SegmentedControlItem } from "seed-design/ui/segmented-control";
import { AppBar, BottomBar, PhoneFrame, Scroll } from "../_lib/shell";
import { useReports } from "../_lib/reports-store";
import { useCurrentDistrict } from "../_lib/location";
import { useFavoriteStores, useIsFavoriteStore } from "../_lib/favorite-stores-store";
import { getStoreItems, type PriceMap, type StoreItemPrice } from "../_lib/stores";
import { HAND_SEED_STORE_NAMES, STORE_NAME_POOL } from "../_lib/vegetables";
import { BASELINE_LABEL, formatDiff, formatNumber, getDiffColorToken } from "../_lib/format";
import { useStoreReviews, type StoreReviewRating } from "../_lib/store-reviews-store";
import { VegetableThumb } from "./vegetable-thumb";
import { FreshnessTag } from "./freshness-tag";
import { FavoriteStoreButton } from "./favorite-store-button";
import { StoreMap } from "./store-map";
import { StorePhoto } from "./store-photo";
import { CommentList } from "./comment-list";

// 이 이름 풀에 있으면 사용자가 실제로 찾아올 수 있는 가게 — URL을 직접 조작해 들어와도
// 이 목록·즐겨찾기·내 제보 어디에도 없는 이름이면 "찾을 수 없는 가게"로 분기한다(백로그 F09 #2).
const KNOWN_STORE_POOL = new Set<string>([...STORE_NAME_POOL, ...HAND_SEED_STORE_NAMES]);

// F09 가게 상세 — "이 가게는 뭐가 싸고 뭐가 비싼가"를 한 화면에서 답한다.
// 정렬은 시세 대비 싼 품목 순 — 이 가게에 갈 이유가 먼저 읽혀야 한다. 단, 이상치는 정렬과
// 무관하게 맨 아래로 내린다(report-list.tsx와 같은 규칙 — 백로그 F09 #6).
export function StoreDetail({
  storeName,
  priceMap,
  todayIso,
}: {
  storeName: string;
  priceMap: PriceMap;
  todayIso: string;
}) {
  const router = useRouter();
  const { district } = useCurrentDistrict();
  const reports = useReports({ district });
  // district 필터 없이 — 내가 직접 올린 제보는 어느 동네든 이 가게가 "실존한다"는 증거가 된다.
  const myReports = useReports();
  const favoriteStores = useFavoriteStores();
  const isFavorite = useIsFavoriteStore(storeName);
  const reviews = useStoreReviews(storeName);

  // localStorage 기반 스토어는 서버 스냅샷이 항상 빈 배열이라, 그대로 렌더하면 "제보 없음"·
  // "댓글 없음"이 한 틱 깜빡인 뒤 실제 목록으로 바뀐다(백로그 F09 #12). 하이드레이션 전엔
  // 로딩 스켈레톤만 보여준다.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  // 단골 토글은 화면에 보이는 변화(아이콘)뿐이라 스크린리더에 아무 것도 안 알린다(#11) —
  // 값이 바뀔 때만(첫 마운트 제외) 알림 문구를 세운다.
  const [announcement, setAnnouncement] = useState("");
  const prevFavoriteRef = useRef<boolean | null>(null);
  useEffect(() => {
    if (prevFavoriteRef.current !== null && prevFavoriteRef.current !== isFavorite) {
      setAnnouncement(isFavorite ? `${storeName} 찜했어요` : `${storeName} 찜을 해제했어요`);
    }
    prevFavoriteRef.current = isFavorite;
  }, [isFavorite, storeName]);

  // 제보가 목록 탭 — 「저렴해요」/「비싸요」. 한 목록에 섞어 두면 싼 것과 비싼 것을 눈으로
  // 골라내야 했다. 이 화면에 오는 이유가 "여기 뭐가 싸냐"라서 그 답만 먼저 볼 수 있어야 한다.
  const [priceTab, setPriceTab] = useState<"cheap" | "expensive">("cheap");

  const items = getStoreItems(reports, storeName, priceMap, todayIso);
  // 이상치는 지우지 않고 맨 아래로 — 정렬(시세 싼 순)은 정상 제보에만 적용한다.
  const normalItems = items.filter((i) => !i.outlier);
  const outlierItems = items.filter((i) => i.outlier);
  const cheaper = normalItems.filter((i) => (i.diffPct ?? 0) < 0);
  // 시세 비교가 불가능한 품목(diffPct null)은 "비쌈"으로 단정할 수 없으니 비싸요 쪽에 두되
  // 차이 표기는 원래대로 생략된다(아래 목록에서 diffPct null이면 그 줄을 그리지 않는다).
  const pricier = normalItems.filter((i) => (i.diffPct ?? 0) >= 0);
  const ordered = [
    ...(priceTab === "cheap" ? cheaper : pricier),
    // 이상치는 어느 탭에서도 마지막에 — 값이 의심스러운 줄이 첫 줄에 오면 목록 전체가 의심받는다.
    ...outlierItems,
  ];

  const isKnownStore =
    items.length > 0 ||
    favoriteStores.includes(storeName) ||
    KNOWN_STORE_POOL.has(storeName) ||
    myReports.some((r) => r.place === storeName);

  // 댓글 작성은 현재 동네 가게에만 — items가 현재 동(district) 기준 제보라 이게 곧
  // "이 가게가 지금 내 동네에 있다"는 신호다(백로그 F09 #9).
  const canWriteComment = items.length > 0;

  const reviewCounts: Record<StoreReviewRating, number> = { good: 0, fair: 0, bad: 0 };
  for (const r of reviews) reviewCounts[r.rating] += 1;
  const hasReviews = reviews.length > 0;

  // "가장 최근 제보" — 목록은 시세 대비 싼 순으로 정렬돼 있어 items[0]이 최신이 아니다.
  // 실제 제보 시점(days 최소)을 따로 찾는다(백로그 F09 #5 — 틀린 문장).
  let mostRecent: StoreItemPrice | null = null;
  for (const i of items) {
    if (!mostRecent || i.freshness.days < mostRecent.freshness.days) mostRecent = i;
  }

  if (!hydrated) {
    return (
      <PhoneFrame>
        <AppBar title={storeName} onBack={() => router.back()} />
        <Scroll className="px-4 pb-8">
          <div className="flex flex-col gap-3 pt-6" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-2xl bg-bg-neutral-weak" />
            ))}
          </div>
        </Scroll>
      </PhoneFrame>
    );
  }

  if (!isKnownStore) {
    return (
      <PhoneFrame>
        <AppBar title="가게 정보" onBack={() => router.back()} />
        <Scroll className="px-4 pb-8">
          <div className="flex flex-col items-center gap-2 pt-16 text-center">
            <p className="text-body-16-semibold text-fg-neutral">찾을 수 없는 가게예요</p>
            <p className="text-body-14-regular text-fg-neutral-muted">
              주소가 바뀌었거나 없는 가게일 수 있어요.
            </p>
            <Link
              href="/prototype/stores"
              className="mt-4 flex min-h-11 items-center justify-center rounded-lg bg-bg-neutral-weak px-4 py-2.5 text-body-14-medium text-fg-neutral active:bg-bg-neutral-weak-pressed"
            >
              가게 둘러보기
            </Link>
          </div>
        </Scroll>
      </PhoneFrame>
    );
  }

  return (
    <PhoneFrame>
      <AppBar
        title={storeName}
        onBack={() => router.back()}
        right={<FavoriteStoreButton storeName={storeName} />}
      />
      <div aria-live="polite" role="status" className="sr-only">
        {announcement}
      </div>
      <Scroll className="px-4 pb-8">
        {/* 간판·외관 사진이 최상단 — 목록·지도에서 이름만 보던 가게를 눈으로 확인하는 자리다.
            Scroll의 좌우 패딩을 -mx-4로 상쇄해 화면 폭을 꽉 채운다. */}
        <div className="-mx-4 mb-4">
          <StorePhoto storeName={storeName} />
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col gap-6 pt-2">
            <div className="flex flex-col items-center gap-2 px-4 text-center">
              <p className="text-body-16-semibold text-fg-neutral">아직 이 가게 제보가 없어요</p>
              <p className="text-body-14-regular text-fg-neutral-muted">
                다녀오셨다면 가격을 남겨주세요. 이웃이 헛걸음하지 않아요.
              </p>
            </div>
            {hasReviews && (
              <p className="text-center text-caption-12-regular text-fg-neutral-muted">
                가게 후기 좋아요 {reviewCounts.good} · 보통 {reviewCounts.fair} · 별로 {reviewCounts.bad}
              </p>
            )}
            {/* 제보가 없어도 위치는 보여준다 — 이 화면에서 유일하게 확실한 정보다 */}
            <StoreMap storeName={storeName} district={district} />
          </div>
        ) : (
          <div className="flex flex-col gap-6 pt-2">
            {/* 요약 — 이 화면의 결론. 아래 목록 섹션 제목보다 위계가 커야 한다(백로그 F09 #14 —
                이전엔 섹션 제목 16/700이 결론 14/600보다 커서 위계가 뒤집혀 있었다). */}
            <section
              aria-label="가게 요약"
              className="flex flex-col gap-2 rounded-2xl bg-bg-neutral-weak px-5 py-4"
            >
              {cheaper.length > 0 ? (
                <p className="text-head2-16 text-fg-positive">
                  {cheaper.length}개 품목이 {BASELINE_LABEL}보다 싸요
                </p>
              ) : (
                <p className="text-head2-16 text-fg-neutral">이웃 제보 {items.length}개 품목</p>
              )}
              <p className="text-caption-12-regular text-fg-neutral-muted">
                {district}
                {mostRecent && ` · 가장 최근 제보 ${mostRecent.freshness.label}`}
                {/* 제보가 1건뿐이면 단언 대신 근거가 얇다는 걸 알린다(백로그 F09 #7) */}
                {reports.filter((r) => r.place === storeName).length === 1 &&
                  " · 제보가 1건뿐이라 참고만 해주세요"}
              </p>
              {hasReviews && (
                <p className="text-caption-12-regular text-fg-neutral-muted">
                  가게 후기 좋아요 {reviewCounts.good} · 보통 {reviewCounts.fair} · 별로 {reviewCounts.bad}
                </p>
              )}
            </section>

            {/* 위치 — 가격 목록보다 먼저다. "갈 만한 거리인가"가 정해져야 가격을 볼 이유가 생긴다 */}
            <StoreMap storeName={storeName} district={district} />

            <section aria-label="품목별 제보가" className="flex flex-col gap-2">
              {/* "이 가게 가격"이 아니라 "제보된 가격" — 가게가 게시한 공식 가격표가 아니라
                  이웃이 보고 남긴 값이다. 이름이 출처를 숨기면 틀린 값의 책임이 가게로 간다.
                  섹션 라벨이라 결론(위 요약)보다 작게 뒀다(#14). */}
              <h2 className="text-body-14-medium text-fg-neutral">이 가게에 제보된 가격</h2>

              {/* 공공 시세 기준 저렴/비쌈 2탭. 개수를 라벨에 붙여, 누르기 전에 어느 쪽이
                  두꺼운지 보이게 한다(빈 탭을 눌러보는 헛수고를 줄인다). */}
              <SegmentedControl
                aria-label="제보가 종류"
                value={priceTab}
                onValueChange={(v) => setPriceTab(v === "expensive" ? "expensive" : "cheap")}
              >
                <SegmentedControlItem value="cheap">저렴해요 {cheaper.length}</SegmentedControlItem>
                <SegmentedControlItem value="expensive">비싸요 {pricier.length}</SegmentedControlItem>
              </SegmentedControl>

              {ordered.length === 0 && (
                <p className="py-8 text-center text-body-14-regular text-fg-neutral-muted">
                  {priceTab === "cheap"
                    ? "공공 시세보다 저렴한 품목이 아직 없어요"
                    : "공공 시세보다 비싼 품목은 없어요"}
                </p>
              )}

              <ul className="flex flex-col gap-2">
                {ordered.map((i) => {
                  const diffWon = i.baselinePrice !== null ? i.price - i.baselinePrice : undefined;
                  return (
                    <li key={i.vegetableId}>
                      <Link
                        href={`/prototype/price/${i.vegetableId}`}
                        className="flex items-center gap-3 rounded-2xl bg-bg-neutral-weak px-4 py-3 active:bg-bg-neutral-weak-pressed"
                      >
                        <VegetableThumb image={i.image} emoji={i.emoji} size="md" />
                        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                          <span className="flex items-center gap-1.5">
                            <span className="text-body-16-semibold text-fg-neutral">{i.name}</span>
                            {i.crossChecks >= 2 && (
                              // 무채색 배지 — 초록은 "싸다" 전용이라 교차검증(신뢰 신호)엔 안 쓴다(#13)
                              <span className="rounded-md bg-bg-layer-default px-1.5 py-0.5 text-caption-12-regular text-fg-neutral-muted">
                                이웃 {i.crossChecks}명 확인
                              </span>
                            )}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <FreshnessTag freshness={i.freshness} />
                            {i.outlier && (
                              <span className="text-caption-12-regular text-fg-warning">
                                확인 필요 · 시세와 차이가 너무 커서 오타일 수 있어요
                              </span>
                            )}
                          </span>
                        </span>
                        <span className="flex shrink-0 flex-col items-end">
                          <span className="text-body-14-medium tabular-nums text-fg-neutral">
                            {formatNumber(i.price)}원
                            <span className="text-fg-neutral-muted"> /{i.unit}</span>
                          </span>
                          {/* 이 줄이 이 화면의 결론이다 — 14px·색·절대 금액 병기(백로그 F09 #4) */}
                          {i.diffPct !== null && (
                            <span
                              className={`text-body-14-medium tabular-nums ${getDiffColorToken(i.diffPct)}`}
                            >
                              {formatDiff(i.diffPct, diffWon)}
                            </span>
                          )}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          </div>
        )}

        {/* 동네 댓글 — F03(시세 화면)에서 이곳으로 옮겨왔다. 화제가 원래 가게 단위라
            품목×동네로 흩어두면 밀도가 안 남는다(백로그 F03 #12). */}
        <section aria-label="동네 댓글" className="flex flex-col gap-3 pt-6">
          <h2 className="text-head2-16 text-fg-neutral">동네 댓글</h2>
          <CommentList
            storeName={storeName}
            todayIso={todayIso}
            hydrated={hydrated}
            canWrite={canWriteComment}
          />
        </section>
      </Scroll>

      {/* 이 가게에 제보하기 — 가게를 이미 특정한 상태라 폼의 가게 선택을 건너뛴다(place 프리필).
          시세 상세의 하단 CTA와 같은 자리·같은 생김새여서, 두 화면에서 제보로 가는 길이 하나로 읽힌다. */}
      <BottomBar>
        <ActionButton asChild variant="neutralSolid" size="large" className="w-full">
          <Link href={`/prototype/report?place=${encodeURIComponent(storeName)}`}>
            이 가게에 제보하기
          </Link>
        </ActionButton>
      </BottomBar>
    </PhoneFrame>
  );
}
