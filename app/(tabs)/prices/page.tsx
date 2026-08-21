import Link from "next/link";
import type { Metadata } from "next";
import { getAccessToken } from "@/app/_lib/api/auth/session";
import { getItemsWithTemporaryFallback } from "@/app/_lib/api/server/items-fallback";
import { getSelectedRegionId } from "@/app/_lib/api/server/selected-region";
import { ROUTES } from "@/app/_lib/routes";
import { PricesGroupChips } from "./_group-chips";
import { PricesInfiniteList } from "./_infinite-list";
import { formatItemBaseDateLabel } from "./_item-view";
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

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function PricesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query = (first(params.q) ?? "").trim();
  const focusSearch = first(params.focus) === "search";
  const group = normalizeGroup(first(params.group));
  const sort = normalizeSort(first(params.sort));
  const [token, regionId] = await Promise.all([getAccessToken(), getSelectedRegionId()]);

  if (!regionId) {
    return (
      <div className="pt-6 pb-20">
        <h1 className="sr-only">야채 시세</h1>
        <MissingRegion />
      </div>
    );
  }

  const apiSort = mapSortToApi(sort);
  const category = mapGroupToApi(group);
  const { page: itemPage } = await getItemsWithTemporaryFallback({
    regionId,
    page: 0,
    size: ITEMS_PAGE_SIZE,
    sort: apiSort,
    keyword: query || undefined,
    category,
    favoriteOnly: false,
    token,
  }, { includeMonthlyComparison: true });
  const counts = mapCategoryCounts(itemPage.categoryCounts);
  const catalogTotalCount = itemPage.categoryCounts
    ? Object.values(counts).reduce((total, count) => total + count, 0)
    : itemPage.totalCount;
  const sortParam = sort === DEFAULT_PRICES_SORT ? undefined : sort;

  return (
    <div className="relative pt-6 pb-20">
      <h1 className="sr-only">야채 시세</h1>

      <div className="px-4">
        <PricesSearchField query={query} group={group} sort={sortParam} autoFocus={focusSearch} />
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
            {formatItemBaseDateLabel(itemPage.baseDate)}
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
        {itemPage.items.length === 0 ? (
          <EmptyResult query={query} />
        ) : (
          <PricesInfiniteList
            key={JSON.stringify([query, group, sort])}
            initialPage={itemPage}
            pageSize={ITEMS_PAGE_SIZE}
            sort={apiSort}
            query={query}
            category={category}
            canFavorite={Boolean(token)}
          />
        )}
      </div>
      <p
        role="note"
        data-data-source="temporary"
        className="mt-8 px-4 text-center text-caption-12-regular text-content-secondary"
      >
        ‘예시’ 표시가 있는 품목은 API 가격이 없어 임시 가격을 표시하고 있어요.
      </p>
    </div>
  );
}
