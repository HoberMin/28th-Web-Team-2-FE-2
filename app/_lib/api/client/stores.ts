"use client";

import { z } from "zod";
import {
  nearbyStoresRequestSchema,
  nearbyStoresSchema,
  type NearbyStores,
  type NearbyStoresRequest,
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
