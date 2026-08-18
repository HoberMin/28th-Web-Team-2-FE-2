import type { MapCenter, MapStore } from "./_data";

export type NearbyStoresStatus = "loading" | "success" | "error";

export interface NearbyStoresState {
  key: string;
  stores: MapStore[];
  status: NearbyStoresStatus;
  error: string | null;
}

export interface NearbyStoresRequestIdentity {
  center: MapCenter;
  radius: number;
  keyword: string;
  onlyLiked: boolean;
}

export function createNearbyStoresRequestKey({
  center,
  radius,
  keyword,
  onlyLiked,
}: NearbyStoresRequestIdentity): string {
  return `${center.lat}|${center.lng}|${radius}|${keyword.trim()}|${onlyLiked}`;
}

export function shouldFetchNearbyStores(currentKey: string, requestKey: string): boolean {
  return currentKey !== requestKey;
}
