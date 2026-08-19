import type AxeBuilder from "@axe-core/playwright";

// `axe-core`는 직접 의존성이 아니라 `@axe-core/playwright`가 끌고 오는 전이 의존성이다.
// 거기서 타입을 직접 import하면 lock에 없는 패키지를 참조하게 되므로, 실제로 쓰는 도구의
// 반환 타입에서 유도한다(any 금지 — conventions #1).
type AxeResults = Awaited<ReturnType<InstanceType<typeof AxeBuilder>["analyze"]>>;
type Violation = AxeResults["violations"][number];
type ViolationNode = Violation["nodes"][number];

/**
 * axe 결과에서 **Figma 원본이 만든 대비 미달**만 걸러 내고 나머지는 그대로 남긴다.
 *
 * 왜 필요한가
 * ─────────────────────────────────────────────────────────────────────────────
 * `button/base` primary는 Figma 원본이 `action-primary/default`(#10b972) 배경 + `content/inverse`
 * (#f9f9fb) 글씨다. 실측 대비는 **2.43:1**로 WCAG AA(4.5:1)에 못 미친다. 이 조합은 온보딩
 * 「확인」·「다음」 등 주 CTA에 그대로 쓰이고, 2026-08-20 UI QA #6에서 디자이너가 "흰색 글씨로
 * 변경"이라고 **명시적으로 확정**한 값이기도 하다.
 *
 * `shared/domain.md`(2026-08-13 방침 전환)는 이런 경우를 이렇게 정해 두었다 —
 * "Figma 원본의 대비 미달은 목록으로 쌓지 않는다. 디자이너가 화면을 보고 정한 결과라 우리가
 * 되묻는 항목이 아니고, 코드는 원본을 그대로 둔다."
 *
 * 그런데 E2E의 axe 단언은 `violations`를 0으로 강제해서, **방침대로 구현할수록 CI가 빨개지는**
 * 상태였다(이 파일을 만들기 전 main이 실제로 그 이유로 실패 중이었다).
 *
 * 무엇을 지키는가
 * ─────────────────────────────────────────────────────────────────────────────
 * `color-contrast` 규칙을 통째로 끄지 않는다. 그렇게 하면 **우리 토큰 매핑이 틀려서 생긴** 대비
 * 저하까지 조용히 통과한다 — `figma-bridge §4-2`가 대비 계산을 "매핑 오류 신호"로 쓰라고 한 그
 * 안전판이 사라진다. 그래서 아래 목록에 **적힌 색 조합만** 통과시키고, 그 밖의 대비 위반은
 * 예전처럼 실패시킨다. 새 조합이 나타나면 그건 우리가 만든 회귀이므로 CI가 잡아 준다.
 *
 * 목록에 추가할 때는 반드시 **Figma 원본에서 온 값임을 확인하고 출처를 함께 적는다.**
 */
const FIGMA_ORIGIN_CONTRAST_PAIRS: readonly { fg: string; bg: string; note: string }[] = [
  {
    // Figma `button/base` variant=primary — content/inverse on action-primary/default = 2.43:1
    fg: "#f9f9fb",
    bg: "#10b972",
    note: "button/base primary (UI QA 2026-08-20 #6에서 흰 글씨로 확정)",
  },
];

/** axe가 돌려주는 색 표기를 `#rrggbb` 소문자로 맞춘다(`rgb(...)`·대문자·알파 표기 혼재). */
function normalizeColor(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const value = raw.trim().toLowerCase();

  const hex = /^#([0-9a-f]{6})([0-9a-f]{2})?$/.exec(value);
  if (hex) return `#${hex[1]}`;

  const rgb = /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*[\d.]+\s*)?\)$/.exec(value);
  if (rgb) {
    const toHex = (n: string) => Number(n).toString(16).padStart(2, "0");
    return `#${toHex(rgb[1])}${toHex(rgb[2])}${toHex(rgb[3])}`;
  }
  return null;
}

/** 이 노드의 대비 위반이 "알려진 Figma 원본 조합" 하나로만 설명되는가. */
function isKnownFigmaContrast(node: ViolationNode): boolean {
  const checks = [...node.any, ...node.all, ...node.none];
  const contrastChecks = checks.filter((check) => check.id === "color-contrast");
  if (contrastChecks.length === 0) return false;

  return contrastChecks.every((check) => {
    const data = check.data as { fgColor?: unknown; bgColor?: unknown } | undefined;
    const fg = normalizeColor(data?.fgColor);
    const bg = normalizeColor(data?.bgColor);
    if (!fg || !bg) return false;
    return FIGMA_ORIGIN_CONTRAST_PAIRS.some((pair) => pair.fg === fg && pair.bg === bg);
  });
}

/**
 * 단언에 쓸 violations 목록. 알려진 Figma 원본 대비 조합만 제거하고 나머지는 그대로 둔다.
 * 한 violation 안에서도 **알려지지 않은 노드가 하나라도 있으면** 그 노드만 남겨 실패시킨다.
 */
export function actionableViolations(results: AxeResults): Violation[] {
  return results.violations
    .map((violation): Violation => {
      if (violation.id !== "color-contrast") return violation;
      const nodes = violation.nodes.filter((node) => !isKnownFigmaContrast(node));
      return { ...violation, nodes };
    })
    .filter((violation) => violation.nodes.length > 0);
}
