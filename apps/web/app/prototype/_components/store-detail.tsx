"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppBar, PhoneFrame, Scroll } from "../_lib/shell";
import { useReports } from "../_lib/reports-store";
import { useCurrentDistrict } from "../_lib/location";
import { getStoreItems, type PriceMap } from "../_lib/stores";
import { formatNumber } from "../_lib/format";
import { VegetableThumb } from "./vegetable-thumb";
import { FreshnessTag } from "./freshness-tag";
import { FavoriteStoreButton } from "./favorite-store-button";
import { StoreMap } from "./store-map";

// F09 가게 상세 — "이 가게는 뭐가 싸고 뭐가 비싼가"를 한 화면에서 답한다.
// 정렬은 시세 대비 싼 품목 순 — 이 가게에 갈 이유가 먼저 읽혀야 한다.
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
  const items = getStoreItems(reports, storeName, priceMap, todayIso);
  const valid = items.filter((i) => !i.outlier);
  const cheaper = valid.filter((i) => (i.diffPct ?? 0) < 0);

  return (
    <PhoneFrame>
      <AppBar
        title={storeName}
        onBack={() => router.back()}
        right={<FavoriteStoreButton storeName={storeName} />}
      />
      <Scroll className="px-4 pb-8">
        {items.length === 0 ? (
          <div className="flex flex-col gap-6 pt-6">
            <div className="flex flex-col items-center gap-2 px-4 text-center">
              <p className="text-body-16-semibold text-fg-neutral">아직 이 가게 제보가 없어요</p>
              <p className="text-body-14-regular text-fg-neutral-muted">
                다녀오셨다면 가격을 남겨주세요. 이웃이 헛걸음하지 않아요.
              </p>
            </div>
            {/* 제보가 없어도 위치는 보여준다 — 이 화면에서 유일하게 확실한 정보다 */}
            <StoreMap storeName={storeName} district={district} />
          </div>
        ) : (
          <div className="flex flex-col gap-6 pt-2">
            {/* 요약 — 이 가게를 한 줄로 */}
            <section
              aria-label="가게 요약"
              className="flex flex-col gap-2 rounded-2xl bg-bg-neutral-weak px-5 py-4"
            >
              <p className="text-body-14-regular text-fg-neutral">
                이웃 제보 <strong className="font-semibold tabular-nums">{items.length}</strong>개 품목
                {cheaper.length > 0 && (
                  <>
                    {" · "}
                    <strong className="font-semibold text-fg-positive">
                      {cheaper.length}개가 시세보다 싸요
                    </strong>
                  </>
                )}
              </p>
              <p className="text-caption-12-regular text-fg-neutral-muted">
                {district} · 가장 최근 제보 {items[0].freshness.label}
              </p>
            </section>

            {/* 위치 — 가격 목록보다 먼저다. "갈 만한 거리인가"가 정해져야 가격을 볼 이유가 생긴다 */}
            <StoreMap storeName={storeName} district={district} />

            <section aria-label="품목별 제보가" className="flex flex-col gap-2">
              {/* "이 가게 가격"이 아니라 "제보된 가격" — 가게가 게시한 공식 가격표가 아니라
                  이웃이 보고 남긴 값이다. 이름이 출처를 숨기면 틀린 값의 책임이 가게로 간다 */}
              <h2 className="text-head2-16 text-fg-neutral">이 가게에 제보된 가격</h2>
              <ul className="flex flex-col gap-2">
                {items.map((i) => (
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
                            <span className="rounded-md bg-bg-positive-weak px-1.5 py-0.5 text-caption-12-regular text-fg-positive">
                              이웃 {i.crossChecks}명 확인
                            </span>
                          )}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <FreshnessTag freshness={i.freshness} />
                          {i.outlier && (
                            <span className="text-caption-12-regular text-fg-warning">확인 필요</span>
                          )}
                        </span>
                      </span>
                      <span className="flex shrink-0 flex-col items-end">
                        <span className="text-body-14-medium tabular-nums text-fg-neutral">
                          {formatNumber(i.price)}원
                          <span className="text-fg-neutral-muted"> /{i.unit}</span>
                        </span>
                        {i.diffPct !== null && (
                          <span
                            className={`text-caption-12-regular tabular-nums ${
                              i.diffPct < 0 ? "text-fg-positive" : "text-fg-neutral-muted"
                            }`}
                          >
                            시세 {i.diffPct < 0 ? "" : "+"}
                            {i.diffPct}%
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        )}
      </Scroll>
    </PhoneFrame>
  );
}
