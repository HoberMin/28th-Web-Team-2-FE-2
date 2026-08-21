import { z } from "zod";
import {
  storeRequestSchema,
  type StoreRequest,
} from "@/app/_lib/api/schemas/reports";

const existingCarriedStoreSchema = z.object({
  kind: z.literal("existing"),
  storeId: z.number().int().positive(),
});

export type ParsedCarriedStore =
  | {
      source: "existing";
      storeId: number;
    }
  | {
      source: "search";
      store: StoreRequest;
      placeName: string;
    };

/**
 * 제보 URL의 장소 값을 검증한다.
 * 기존 매장 진입은 `storeId`, 장소 검색 결과는 Spring의 `StoreRequest` 전체를 사용한다.
 */
export function parseCarriedStore(raw: string | undefined): ParsedCarriedStore | undefined {
  if (!raw) return undefined;

  try {
    const value: unknown = JSON.parse(raw);
    const existing = existingCarriedStoreSchema.safeParse(value);
    if (existing.success) {
      return {
        source: "existing",
        storeId: existing.data.storeId,
      };
    }

    const searched = storeRequestSchema.safeParse(value);
    return searched.success
      ? { source: "search", store: searched.data, placeName: searched.data.placeName }
      : undefined;
  } catch {
    return undefined;
  }
}
