import { MAP_STORES, type PrototypeMapStore } from "@/app/(tabs)/stores/_data";
import { z } from "zod";

export interface StoreDetailPrice {
  id: string;
  name: string;
  age: string;
  price: string;
  unit: string;
  trend: string;
  kind: "cheap" | "expensive";
}

export interface StoreDetailData {
  address: string;
  imageName?: string;
  hours: string[];
  prices: StoreDetailPrice[];
}

const FIGMA_ONION_PRICES: StoreDetailPrice[] = Array.from({ length: 9 }, (_, index) => ({
  id: `nh-detail-${index + 1}`,
  name: "양파",
  age: index < 2 ? "3일 전" : `${index + 2}일 전`,
  price: "24,900원",
  unit: "/100kg",
  trend: "▼ 1,000원(-7.4%)",
  kind: index === 7 ? "expensive" : "cheap",
}));

const DEFAULT_ADDRESS = "서울 광진구 능동로 120";

type StoreDetailSearchParams = Record<string, string | string[] | undefined>;

const temporaryStoreQuerySchema = z.object({
  backendStoreId: z.string().trim().min(1).max(100).optional(),
  name: z.string().trim().min(1).max(100).optional(),
  address: z.string().trim().min(1).max(255).optional(),
  phone: z.string().trim().min(1).max(30).optional(),
});

export interface TemporaryStoreDetailContext {
  store: PrototypeMapStore;
  /** 지도에서 백엔드 가게를 선택해 들어온 경우에만 true다. */
  hasBackendSummary: boolean;
}

function firstQueryValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/**
 * 상세 API가 생기기 전 지도에서 전달받은 가게 요약 정보로 임시 상세 모델을 만든다.
 * 쿼리는 URL에서 오므로 길이·공백을 검증하고, 누락되면 기존 prototype 값을 사용한다.
 */
export function getTemporaryStoreDetailContext(
  params: StoreDetailSearchParams,
): TemporaryStoreDetailContext {
  const parsed = temporaryStoreQuerySchema.safeParse({
    backendStoreId: firstQueryValue(params.backendStoreId),
    name: firstQueryValue(params.name),
    address: firstQueryValue(params.address),
    phone: firstQueryValue(params.phone),
  });
  const query = parsed.success ? parsed.data : {};
  const baseStore = MAP_STORES[0];

  return {
    store: {
      ...baseStore,
      id: "temporary",
      name: query.name ?? baseStore.name,
      address: query.address ?? baseStore.address,
      phone: query.phone ?? baseStore.phone,
      isLiked: false,
    },
    hasBackendSummary: Boolean(query.backendStoreId),
  };
}

export function getStoreDetailData(store: PrototypeMapStore): StoreDetailData {
  if (store.id === "nh-haniro" || store.id === "temporary") {
    return {
      address:
        store.id === "temporary"
          ? store.address ?? DEFAULT_ADDRESS
          : "강원도 속초시 대포항희망길 83 대포항수산시장 D동 7호",
      imageName: "store-detail-hero.png",
      hours: [
        "매일",
        "10:30 - 21:00",
        "16:00 - 17:00 브레이크타임",
        "15:00, 20:00 라스트오더",
      ],
      prices: FIGMA_ONION_PRICES,
    };
  }

  return {
    address: DEFAULT_ADDRESS,
    imageName: undefined,
    hours: ["매일", store.openHours.replace(/^수\s*/, "")],
    prices: store.reports.map((report, index) => ({
      id: `${report.id}-detail`,
      name: report.name,
      age: index === 0 ? "오늘" : "어제",
      price: report.price,
      unit: report.unit,
      trend: "▼ 1,000원(-7.4%)",
      kind: "cheap",
    })),
  };
}
