"use client";

import { useEffect, useRef, useState } from "react";
import { QueryClient, QueryClientProvider, useInfiniteQuery } from "@tanstack/react-query";
import {
  itemPageSchema,
  type ItemCategory,
  type ItemPage,
  type ItemSort,
} from "@/app/_lib/api/schemas/items";
import { LoadingCircular } from "@/app/_components/loading-circular";
import { mapItemToPriceView } from "./_item-view";
import { PriceVegetableCard } from "./_price-vegetable-card";

interface PricesInfiniteListProps {
  initialPage: ItemPage;
  pageSize: number;
  sort: ItemSort;
  query: string;
  category?: ItemCategory;
  canFavorite: boolean;
}

interface FetchItemsPageParams {
  page: number;
  pageSize: number;
  sort: ItemSort;
  query: string;
  category?: ItemCategory;
  signal: AbortSignal;
}

async function fetchItemsPage({
  page,
  pageSize,
  sort,
  query,
  category,
  signal,
}: FetchItemsPageParams): Promise<ItemPage> {
  const params = new URLSearchParams({
    page: String(page),
    size: String(pageSize),
    sort,
  });
  if (query) params.set("keyword", query);
  if (category) params.set("category", category);

  const response = await fetch(`/api/items?${params.toString()}`, {
    cache: "no-store",
    headers: { Accept: "application/json" },
    signal,
  });
  if (!response.ok) {
    throw new Error(`다음 야채 시세 요청 실패 (${response.status})`);
  }

  const payload: unknown = await response.json();
  return itemPageSchema.parse(payload);
}

function PricesInfiniteListContent({
  initialPage,
  pageSize,
  sort,
  query,
  category,
  canFavorite,
}: PricesInfiniteListProps) {
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
  } = useInfiniteQuery({
    queryKey: ["prices", query, category, sort, pageSize] as const,
    queryFn: ({ pageParam, signal }) =>
      fetchItemsPage({ page: pageParam, pageSize, sort, query, category, signal }),
    initialPageParam: initialPage.page,
    initialData: {
      pages: [initialPage],
      pageParams: [initialPage.page],
    },
    getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.page + 1 : undefined),
    staleTime: 30_000,
  });

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || !hasNextPage || isFetchingNextPage || isFetchNextPageError) return;

    const scrollRoot = target.closest("main");
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) void fetchNextPage();
      },
      {
        root: scrollRoot instanceof HTMLElement ? scrollRoot : null,
        rootMargin: "0px 0px 320px",
      },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, isFetchNextPageError]);

  const rows = data.pages.flatMap((page) => page.items).map(mapItemToPriceView);

  return (
    <>
      <p role="status" className="sr-only">
        조건에 맞는 야채 {initialPage.totalCount}개 중 {rows.length}개
      </p>
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
              canFavorite={canFavorite}
            />
          </li>
        ))}
      </ul>
      <div ref={loadMoreRef} className="flex min-h-16 items-center justify-center">
        {isFetchingNextPage ? (
          <LoadingCircular animate label="야채 시세를 더 불러오고 있어요" />
        ) : null}
        {isFetchNextPageError ? (
          <button
            type="button"
            onClick={() => void fetchNextPage()}
            className="inline-flex min-h-11 items-center px-4 text-body-14-medium text-content-primary underline"
          >
            더 불러오기 다시 시도
          </button>
        ) : null}
        {!hasNextPage && !isFetchNextPageError ? (
          <span className="sr-only">모든 야채 시세를 불러왔어요.</span>
        ) : null}
      </div>
    </>
  );
}

export function PricesInfiniteList(props: PricesInfiniteListProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <PricesInfiniteListContent {...props} />
    </QueryClientProvider>
  );
}
