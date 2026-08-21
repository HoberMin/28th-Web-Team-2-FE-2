import { ROUTES } from "@/app/_lib/routes";

export interface ExistingReportStore {
  storeId: number;
}

export function buildItemReportHref(itemId: number): string {
  const params = new URLSearchParams({ item: String(itemId) });
  return `${ROUTES.report}?${params.toString()}`;
}

export function buildExistingStoreReportHref(store: ExistingReportStore): string {
  const params = new URLSearchParams({
    store: JSON.stringify({
      kind: "existing",
      storeId: store.storeId,
    }),
  });
  return `${ROUTES.report}?${params.toString()}`;
}
