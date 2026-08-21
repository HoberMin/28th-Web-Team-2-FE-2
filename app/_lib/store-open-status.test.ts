import { afterEach, describe, expect, it, vi } from "vitest";
import { resolveStoreOpenStatus } from "./store-open-status";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("resolveStoreOpenStatus", () => {
  it("백엔드가 실제로 주는 세 값을 한국어 문구로 바꾼다", () => {
    expect(resolveStoreOpenStatus("OPEN")).toEqual({ state: "open", label: "영업중" });
    expect(resolveStoreOpenStatus("CLOSED")).toEqual({ state: "closed", label: "영업종료" });
    expect(resolveStoreOpenStatus("UNKNOWN")).toEqual({
      state: "closed",
      label: "영업정보 없음",
    });
  });

  it("공백·대소문자 차이를 흡수한다", () => {
    expect(resolveStoreOpenStatus(" open ")).toEqual({ state: "open", label: "영업중" });
  });

  it("값이 없거나 빈 문자열이면 undefined — 부르는 쪽이 줄을 비울지 정한다", () => {
    expect(resolveStoreOpenStatus(null)).toBeUndefined();
    expect(resolveStoreOpenStatus(undefined)).toBeUndefined();
    expect(resolveStoreOpenStatus("   ")).toBeUndefined();
  });

  it("모르는 값은 화면에 흘리지 않고 기본 문구로 떨어뜨리고 로그를 남긴다", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    expect(resolveStoreOpenStatus("BREAK_TIME")).toEqual({
      state: "closed",
      label: "영업정보 없음",
    });
    expect(warn).toHaveBeenCalledWith("모르는 openStatus 값", { openStatus: "BREAK_TIME" });
  });
});
