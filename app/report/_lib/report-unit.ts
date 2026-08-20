/**
 * Spring은 제보 unit이 품목 defaultUnit과 문자열까지 같아야 저장한다.
 * 화면 표시를 위해 접두 수량을 제거하지 않고, 공백 값만 제출 불가로 좁힌다.
 */
export function getExactReportUnit(defaultUnit: string | null | undefined): string | undefined {
  const unit = defaultUnit?.trim();
  return unit || undefined;
}
