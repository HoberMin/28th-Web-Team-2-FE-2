// 야채 검색 매칭 — 46종이 되면서 이름을 정확히 입력해야 찾히는 게 병목이 됐다.
//
// 한국어 검색에서 사람들은 초성을 친다("ㄱㅈ" → 감자). 초성 매칭이 없으면 "고춧가루(국산)"처럼
// 긴 이름은 사실상 검색으로 못 찾는다.

const CHOSUNG = [
  "ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ",
  "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ",
];

const HANGUL_START = 0xac00;
const HANGUL_END = 0xd7a3;
/** 한 초성이 담당하는 음절 수(중성 21 × 종성 28) */
const SYLLABLES_PER_CHOSUNG = 588;

/** "감자" → "ㄱㅈ". 한글이 아닌 문자는 그대로 둔다. */
export function toChosung(text: string): string {
  let out = "";
  for (const char of text) {
    const code = char.charCodeAt(0);
    if (code >= HANGUL_START && code <= HANGUL_END) {
      out += CHOSUNG[Math.floor((code - HANGUL_START) / SYLLABLES_PER_CHOSUNG)];
    } else {
      out += char;
    }
  }
  return out;
}

/** 입력이 초성만으로 이뤄졌는지 — 초성 검색을 켤지 판단한다. */
function isChosungOnly(query: string): boolean {
  return query.length > 0 && [...query].every((c) => CHOSUNG.includes(c));
}

/**
 * 품목명이 검색어에 걸리는지.
 * 초성만 입력했으면 초성으로, 아니면 부분 문자열로 찾는다.
 * (초성 입력에도 부분 문자열을 함께 보면 "ㄱ" 하나에 온갖 게 걸려 결과가 무의미해진다)
 */
export function matchesVegetableName(name: string, query: string): boolean {
  const q = query.trim();
  if (!q) return true;
  if (isChosungOnly(q)) return toChosung(name).includes(q);
  return name.includes(q);
}
