import Link from "next/link";
import type { Metadata } from "next";
import { getAccessToken } from "@/app/_lib/api/auth/session";
import { getItems } from "@/app/_lib/api/server/items";
import { getSelectedRegionId } from "@/app/_lib/api/server/selected-region";
import { formatAsOfLabel } from "@/app/_lib/format";
import { ROUTES } from "@/app/_lib/routes";
import { PricesGroupChips } from "./_group-chips";
import { buildPricesHref } from "./_href";
import { mapItemToPriceView } from "./_item-view";
import { PriceVegetableCard } from "./_price-vegetable-card";
import {
  DEFAULT_PRICES_SORT,
  PRICE_GROUPS,
  PRICES_SORT_OPTIONS,
  getSortLabel,
  mapCategoryCounts,
  mapGroupToApi,
  mapSortToApi,
  normalizeGroup,
  normalizeSort,
} from "./_query";
import { PricesSearchField } from "./_search-field";
import { PricesSortControl } from "./_sort-control";

const ITEMS_PAGE_SIZE = 18;

export const metadata: Metadata = {
  title: "야채 시세",
};

function EmptyResult({ query }: { query: string }) {
  return (
    <div className="flex flex-col items-center gap-2 py-16 text-center">
      <p className="text-body-16-semibold text-content-primary">찾는 야채가 없어요</p>
      <p className="text-body-14-regular text-content-secondary">
        {query ? `‘${query}’와 이름이 맞는 야채를 찾지 못했어요.` : "조건에 맞는 야채가 없어요."}
      </p>
      <Link
        href={ROUTES.prices}
        className="mt-2 inline-flex min-h-11 items-center justify-center rounded-lg bg-action-tertiary-default px-4 py-2 text-body-14-medium text-content-primary"
      >
        전체 야채 보기
      </Link>
    </div>
  );
}

function MissingRegion() {
  return (
    <div className="flex flex-col items-center gap-2 px-4 py-20 text-center">
      <p className="text-title-18-bold text-content-primary">동네 정보가 필요해요</p>
      <p className="text-body-14-regular text-content-secondary">
        온보딩에서 동네를 선택하면 주변 시세를 볼 수 있어요.
      </p>
    </div>
  );
}

function Pagination({
  currentPage,
  hasNext,
  query,
  group,
  sort,
}: {
  currentPage: number;
  hasNext: boolean;
  query: string;
  group?: string;
  sort?: string;
}) {
  if (currentPage === 1 && !hasNext) return null;

  return (
    <nav aria-label="야채 시세 페이지" className="mt-10 flex items-center justify-center gap-4">
      {currentPage > 1 ? (
        <Link
          href={buildPricesHref({ q: query, group, sort, page: currentPage - 1 })}
          className="inline-flex min-h-11 items-center px-3 text-body-14-medium text-content-primary underline"
        >
          이전
        </Link>
      ) : (
        <span className="inline-flex min-h-11 items-center px-3 text-body-14-medium text-content-disabled">
          이전
        </span>
      )}
      <span className="text-body-14-regular text-content-secondary">{currentPage}페이지</span>
      {hasNext ? (
        <Link
          href={buildPricesHref({ q: query, group, sort, page: currentPage + 1 })}
          className="inline-flex min-h-11 items-center px-3 text-body-14-medium text-content-primary underline"
        >
          다음
        </Link>
      ) : (
        <span className="inline-flex min-h-11 items-center px-3 text-body-14-medium text-content-disabled">
          다음
        </span>
      )}
    </nav>
  );
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function parsePage(value: string | undefined): number {
  const page = Number(value);
  return Number.isSafeInteger(page) && page > 0 ? page : 1;
}

export default async function PricesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query = (first(params.q) ?? "").trim();
  const group = normalizeGroup(first(params.group));
  const sort = normalizeSort(first(params.sort));
  const requestedPage = parsePage(first(params.page));
  const [token, regionId] = await Promise.all([getAccessToken(), getSelectedRegionId()]);

  if (!regionId) {
    return (
      <div className="pt-6 pb-20">
        <h1 className="sr-only">야채 시세</h1>
        <MissingRegion />
      </div>
    );
  }

  const itemPage = await getItems({
    regionId,
    page: requestedPage - 1,
    size: ITEMS_PAGE_SIZE,
    sort: mapSortToApi(sort),
    keyword: query || undefined,
    category: mapGroupToApi(group),
    favoriteOnly: false,
    token,
  });
  const rows = itemPage.items.map(mapItemToPriceView);
  const counts = mapCategoryCounts(itemPage.categoryCounts);
  const catalogTotalCount = itemPage.categoryCounts
    ? Object.values(counts).reduce((total, count) => total + count, 0)
    : itemPage.totalCount;
  const currentPage = itemPage.page + 1;
  const sortParam = sort === DEFAULT_PRICES_SORT ? undefined : sort;

  return (
    <div className="pt-6 pb-20">
      <h1 className="sr-only">야채 시세</h1>

      <div className="px-4">
        <PricesSearchField query={query} group={group} sort={sortParam} />
      </div>

      <div className="mt-4">
        <PricesGroupChips
          groups={PRICE_GROUPS.map(({ label }) => label)}
          counts={counts}
          totalCount={catalogTotalCount}
          selected={group}
          query={query}
          sort={sortParam}
        />
      </div>

      <div className="mt-2 flex items-center justify-end gap-0.5 px-4">
        <div className="flex items-center gap-2">
          <span className="text-body-14-regular text-content-secondary">
            {formatAsOfLabel(itemPage.baseDate)}
          </span>
          <span aria-hidden="true" className="h-3.5 w-px shrink-0 bg-border-primary" />
        </div>
        <PricesSortControl
          options={PRICES_SORT_OPTIONS}
          value={sort}
          label={getSortLabel(sort)}
          query={query}
          group={group}
        />
      </div>

      <div className="mt-2 px-4">
        <p role="status" className="sr-only">
          조건에 맞는 야채 {itemPage.totalCount}개 중 {rows.length}개
        </p>
        {rows.length === 0 ? (
          <EmptyResult query={query} />
        ) : (
          <ul className="grid grid-cols-3 gap-x-3 gap-y-10">
            {rows.map((row) => (
              <li key={row.itemId}>
                <PriceVegetableCard
                  itemId={row.itemId}
                  name={row.name}
                  image={row.image}
                  price={row.price}
                  unit={row.unit}
                  trendState={row.trendState}
                  trendAmount={row.trendAmount}
                  trendPercent={row.trendPercent}
                  initialFavorite={row.isLiked}
                  canFavorite={Boolean(token)}
                />
              </li>
            ))}
          </ul>
        )}
        <Pagination
          currentPage={currentPage}
          hasNext={itemPage.hasNext}
          query={query}
          group={group}
          sort={sortParam}
        />
      </div>
    </div>
  );
}
