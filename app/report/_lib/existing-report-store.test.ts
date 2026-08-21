import { beforeEach, describe, expect, it, vi } from "vitest";

const { getStoreDetailMock } = vi.hoisted(() => ({ getStoreDetailMock: vi.fn() }));
vi.mock("@/app/_lib/api/server/stores", () => ({ getStoreDetail: getStoreDetailMock }));

import { ApiError } from "@/app/_lib/api/api-error";
import { getExistingReportStoreSelection } from "./existing-report-store";

describe("기존 매장 제보 선택", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("표시 이름을 URL이 아니라 서버 상세 응답에서 가져온다", async () => {
    getStoreDetailMock.mockResolvedValue({ storeName: "서버가 확인한 가게" });

    await expect(
      getExistingReportStoreSelection({ storeId: 7, token: "access-token" }),
    ).resolves.toEqual({
      source: "existing",
      storeId: 7,
      placeName: "서버가 확인한 가게",
    });
  });

  it("서버에서 매장을 확인하지 못하면 미선택 상태로 처리한다", async () => {
    getStoreDetailMock.mockRejectedValue(ApiError.fromStatus(404, "/api/v1/stores/7"));

    await expect(
      getExistingReportStoreSelection({ storeId: 7, token: undefined }),
    ).resolves.toBeUndefined();
  });
});
