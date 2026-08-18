"use client";

export const REGION_LOCATION_TIMEOUT_MS = 8_000;

export type BrowserLocationErrorKind =
  | "unsupported"
  | "denied"
  | "timeout"
  | "unavailable";

export class BrowserLocationError extends Error {
  readonly kind: BrowserLocationErrorKind;

  constructor(kind: BrowserLocationErrorKind) {
    super("현재 위치를 확인하지 못했어요. 동 이름으로 검색해 주세요.");
    this.name = "BrowserLocationError";
    this.kind = kind;
  }
}

export function getCurrentCoordinates(
  timeoutMs = REGION_LOCATION_TIMEOUT_MS,
): Promise<{ latitude: number; longitude: number }> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new BrowserLocationError("unsupported"));
      return;
    }

    let settled = false;
    const settle = (
      result:
        | { status: "success"; latitude: number; longitude: number }
        | { status: "error"; error: BrowserLocationError },
    ) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(safetyTimer);
      if (result.status === "success") {
        resolve({ latitude: result.latitude, longitude: result.longitude });
      } else {
        reject(result.error);
      }
    };

    // 일부 브라우저는 권한 프롬프트가 방치되면 API timeout 콜백도 호출하지 않는다.
    const safetyTimer = window.setTimeout(
      () => settle({ status: "error", error: new BrowserLocationError("timeout") }),
      timeoutMs,
    );

    navigator.geolocation.getCurrentPosition(
      (position) =>
        settle({
          status: "success",
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }),
      (error) => {
        const kind: BrowserLocationErrorKind =
          error.code === 1 ? "denied" : error.code === 3 ? "timeout" : "unavailable";
        settle({ status: "error", error: new BrowserLocationError(kind) });
      },
      { timeout: timeoutMs, maximumAge: 300_000 },
    );
  });
}
