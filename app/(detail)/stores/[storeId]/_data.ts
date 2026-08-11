import type { MapStore } from "@/app/(tabs)/stores/_data";

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

export function getStoreDetailData(store: MapStore): StoreDetailData {
  if (store.id === "nh-haniro") {
    return {
      address: "강원도 속초시 대포항희망길 83 대포항수산시장 D동 7호",
      imageName: "store-thumbnail.png",
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
    imageName: store.id === "uri-cheonggwa" ? undefined : "store-thumbnail.png",
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
