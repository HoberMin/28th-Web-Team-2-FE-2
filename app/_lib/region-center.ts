import { REGIONS } from "./regions";

export interface RegionCenter {
  lat: number;
  lng: number;
}

/**
 * Spring에서 받은 법정동 표시명을 프론트의 행정동 중심 좌표와 연결한다.
 *
 * 동명이 같은 지역은 전체 지역명에 구명이 포함됐는지로 한 번 더 좁힌다.
 * 매칭하지 못했을 때 특정 지역 좌표로 폴백하면 선택한 동네와 다른 API
 * 호출이 되므로 null을 반환해 호출부가 멈추게 한다.
 */
export function findRegionCenter(regionName: string): RegionCenter | null {
  const normalizedName = regionName.trim();
  if (!normalizedName) return null;

  const labelMatches = REGIONS.filter((region) => normalizedName.endsWith(region.label));
  if (labelMatches.length === 0) return null;
  if (labelMatches.length === 1) {
    const [region] = labelMatches;
    return { lat: region.lat, lng: region.lng };
  }

  const districtMatch = labelMatches.find((region) => {
    const [, district] = region.id.split("-");
    return district ? normalizedName.includes(district) : false;
  });
  return districtMatch ? { lat: districtMatch.lat, lng: districtMatch.lng } : null;
}

/** 지도 배지에는 전체 주소 대신 사용자가 고른 마지막 행정동명을 보여 준다. */
export function getRegionDisplayName(regionName: string): string {
  const parts = regionName.trim().split(/\s+/);
  return parts.at(-1) || regionName;
}
