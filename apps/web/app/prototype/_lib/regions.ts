// 온보딩 지역 선택용 더미 지역 목록 — 서울 25개 자치구 + 경기 주요 시/구.
// KAMIS가 서울 광역 시세만 제공하므로, 이 선택은 "우리 동네 제보" 맥락(위치 배지·제보 필터)에 쓰인다.

export interface Region {
  id: string;
  label: string;
}

const SEOUL_DISTRICTS = [
  "강남구", "강동구", "강북구", "강서구", "관악구", "광진구", "구로구", "금천구",
  "노원구", "도봉구", "동대문구", "동작구", "마포구", "서대문구", "서초구", "성동구",
  "성북구", "송파구", "양천구", "영등포구", "용산구", "은평구", "종로구", "중구", "중랑구",
];

const GYEONGGI_DISTRICTS = [
  "경기도 수원시 팔달구",
  "경기도 수원시 영통구",
  "경기도 수원시 장안구",
  "경기도 수원시 권선구",
  "경기도 성남시 분당구",
  "경기도 성남시 수정구",
  "경기도 성남시 중원구",
  "경기도 용인시 수지구",
  "경기도 용인시 기흥구",
  "경기도 용인시 처인구",
  "경기도 고양시 일산동구",
  "경기도 고양시 일산서구",
  "경기도 고양시 덕양구",
  "경기도 부천시",
  "경기도 안양시 동안구",
  "경기도 안양시 만안구",
  "경기도 안산시 단원구",
  "경기도 안산시 상록구",
  "경기도 화성시",
  "경기도 평택시",
  "경기도 의정부시",
  "경기도 시흥시",
  "경기도 파주시",
  "경기도 김포시",
  "경기도 광명시",
  "경기도 광주시",
  "경기도 남양주시",
  "경기도 하남시",
];

export const REGIONS: Region[] = [
  ...SEOUL_DISTRICTS.map((label) => ({ id: `seoul-${label}`, label })),
  ...GYEONGGI_DISTRICTS.map((label) => ({ id: `gg-${label}`, label })),
];

/** 지역명 부분일치 필터(간단 검색). */
export function searchRegions(query: string): Region[] {
  const q = query.trim();
  if (!q) return REGIONS;
  return REGIONS.filter((r) => r.label.includes(q));
}
