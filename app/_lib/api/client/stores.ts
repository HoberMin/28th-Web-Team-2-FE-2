"use client";

import { z } from "zod";
import {
  nearbyStoresRequestSchema,
  nearbyStoresSchema,
  storeDetailSchema,
  storeReportsSchema,
  type NearbyStores,
  type NearbyStoresRequest,
  type StoreDetail,
  type StoreReports,
} from "../schemas/stores";

export const STORES_QUERY_DEBOUNCE_MS = 300;

const errorResponseSchema = z.object({ message: z.string() });

export class StoresClientError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "StoresClientError";
    this.status = status;
  }
}

export async function getNearbyStoresAPI(
  params: NearbyStoresRequest,
  signal?: AbortSignal,
): Promise<NearbyStores> {
  const parsed = nearbyStoresRequestSchema.safeParse(params);
  if (!parsed.success) {
    throw new StoresClientError(400, "가게 조회 조건을 확인해 주세요.");
  }

  const query = new URLSearchParams({
    latitude: String(parsed.data.latitude),
    longitude: String(parsed.data.longitude),
    radius: String(parsed.data.radius),
    onlyLiked: String(parsed.data.onlyLiked),
  });
  if (parsed.data.keyword) query.set("keyword", parsed.data.keyword);

  const response = await fetch(`/api/stores/nearby?${query}`, {
    cache: "no-store",
    signal,
  });

  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null);
    const errorBody = errorResponseSchema.safeParse(body);
    throw new StoresClientError(
      response.status,
      errorBody.success ? errorBody.data.message : "주변 가게를 불러오지 못했어요.",
    );
  }

  const body: unknown = await response.json();
  const stores = nearbyStoresSchema.safeParse(body);
  if (!stores.success) {
    throw new StoresClientError(502, "주변 가게 응답을 확인할 수 없어요.");
  }
  return stores.data;
}

/** 지도 시트(F03-2)가 마커를 누른 시점에 부르는 가게 상세 — 좌표를 넘기면 거리·도보시간이 채워진다. */
export async function getStoreDetailAPI(
  storeId: number,
  params: { latitude?: number; longitude?: number },
  signal?: AbortSignal,
): Promise<StoreDetail> {
  const query = new URLSearchParams();
  if (params.latitude !== undefined) query.set("latitude", String(params.latitude));
  if (params.longitude !== undefined) query.set("longitude", String(params.longitude));
  const qs = query.toString();

  const response = await fetch(`/api/stores/${storeId}${qs ? `?${qs}` : ""}`, {
    cache: "no-store",
    signal,
  });

  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null);
    const errorBody = errorResponseSchema.safeParse(body);
    throw new StoresClientError(
      response.status,
      errorBody.success ? errorBody.data.message : "가게 정보를 불러오지 못했어요.",
    );
  }

  const body: unknown = await response.json();
  const detail = storeDetailSchema.safeParse(body);
  if (!detail.success) {
    throw new StoresClientError(502, "가게 정보 응답을 확인할 수 없어요.");
  }
  return detail.data;
}

/** 지도 시트의 "최근 제보" — Figma 규격상 최대 2개만 쓰지만 재사용을 위해 개수를 열어 둔다. */
export async function getStoreRecentReportsAPI(
  storeId: number,
  size: number,
  signal?: AbortSignal,
): Promise<StoreReports> {
  const response = await fetch(`/api/stores/${storeId}/reports?size=${size}`, {
    cache: "no-store",
    signal,
  });

  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null);
    const errorBody = errorResponseSchema.safeParse(body);
    throw new StoresClientError(
      response.status,
      errorBody.success ? errorBody.data.message : "최근 제보를 불러오지 못했어요.",
    );
  }

  const body: unknown = await response.json();
  const reports = storeReportsSchema.safeParse(body);
  if (!reports.success) {
    throw new StoresClientError(502, "최근 제보 응답을 확인할 수 없어요.");
  }
  return reports.data;
}
