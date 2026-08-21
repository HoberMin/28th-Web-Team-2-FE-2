export interface MapScreenPoint {
  x: number;
  y: number;
}

export interface MapScreenSize {
  width: number;
  height: number;
}

export function isPointInsideMap(point: MapScreenPoint, size: MapScreenSize): boolean {
  return (
    Number.isFinite(point.x) &&
    Number.isFinite(point.y) &&
    point.x >= 0 &&
    point.x < size.width &&
    point.y >= 0 &&
    point.y < size.height
  );
}

export interface StoreMarkerCluster<TStore> extends MapScreenPoint {
  id: string;
  stores: TStore[];
}

/** Figma 축소 마커(32px)가 서로 겹치지 않도록 두 중심 사이에 둘 최소 거리. */
export const STORE_CLUSTER_DISTANCE_PX = 40;

/**
 * 화면 픽셀 좌표를 기준으로 가까운 가게를 연결 요소 단위로 묶는다.
 * A-B와 B-C가 가까우면 A-C가 직접 가깝지 않아도 같은 클러스터가 되어 마커가 중복되지 않는다.
 */
export function clusterStoreMarkers<TStore extends { id: string }>(
  stores: readonly TStore[],
  points: Readonly<Record<string, MapScreenPoint | undefined>>,
  distance = STORE_CLUSTER_DISTANCE_PX,
): StoreMarkerCluster<TStore>[] {
  const positioned = stores.flatMap((store) => {
    const point = points[store.id];
    return point ? [{ store, point }] : [];
  });
  const parent = positioned.map((_, index) => index);

  const find = (index: number): number => {
    let root = index;
    while (parent[root] !== root) root = parent[root];
    while (parent[index] !== index) {
      const next = parent[index];
      parent[index] = root;
      index = next;
    }
    return root;
  };

  const union = (left: number, right: number) => {
    const leftRoot = find(left);
    const rightRoot = find(right);
    if (leftRoot !== rightRoot) parent[rightRoot] = leftRoot;
  };

  const thresholdSquared = distance * distance;
  for (let left = 0; left < positioned.length; left += 1) {
    for (let right = left + 1; right < positioned.length; right += 1) {
      const dx = positioned[left].point.x - positioned[right].point.x;
      const dy = positioned[left].point.y - positioned[right].point.y;
      if (dx * dx + dy * dy < thresholdSquared) union(left, right);
    }
  }

  const grouped = new Map<number, typeof positioned>();
  positioned.forEach((item, index) => {
    const root = find(index);
    const group = grouped.get(root);
    if (group) group.push(item);
    else grouped.set(root, [item]);
  });

  return Array.from(grouped.values(), (group) => {
    const storesInCluster = group.map(({ store }) => store);
    const x = group.reduce((sum, { point }) => sum + point.x, 0) / group.length;
    const y = group.reduce((sum, { point }) => sum + point.y, 0) / group.length;
    const id = storesInCluster
      .map(({ id: storeId }) => storeId)
      .sort()
      .join("|");
    return { id, stores: storesInCluster, x, y };
  });
}
