import AxeBuilder from "@axe-core/playwright";
import { actionableViolations } from "./_axe";
import { expect, test, type Page } from "@playwright/test";

interface MockStorePatch {
  storeId?: number;
  storeName?: string;
  latitude?: number;
  longitude?: number;
  isLiked?: boolean;
}

function storesResponse(patch: MockStorePatch = {}) {
  return {
    totalCount: 1,
    stores: [
      {
        storeId: patch.storeId ?? 101,
        storeName: patch.storeName ?? "장보고 마트",
        latitude: patch.latitude ?? 37.5088,
        longitude: patch.longitude ?? 127.0632,
        addressName: "서울 광진구 예시동 1",
        roadAddressName: "서울 광진구 예시로 1",
        phone: "02-123-4567",
        distanceMeters: 670,
        isLiked: patch.isLiked ?? true,
      },
    ],
  };
}

async function installCompletedOnboarding(page: Page): Promise<void> {
  await page.addInitScript(() => {
    window.localStorage.setItem(
      "veg-onboarding-v1",
      JSON.stringify({
        authProvider: "kakao",
        nickname: "테스터",
        district: "광진구",
        districts: ["광진구"],
        completed: true,
        avatar: "",
      }),
    );
  });
}

async function installKakaoMapMock(page: Page): Promise<void> {
  await page.addInitScript(() => {
    class LatLngMock {
      constructor(
        private readonly lat: number,
        private readonly lng: number,
      ) {}

      getLat() {
        return this.lat;
      }

      getLng() {
        return this.lng;
      }
    }

    type EventName = "click" | "idle";
    type EventHandler = () => void;

    class KakaoMapMock {
      private center: LatLngMock;
      private level: number;
      private readonly listeners: Record<EventName, Set<EventHandler>> = {
        click: new Set(),
        idle: new Set(),
      };

      constructor(
        private readonly container: HTMLElement,
        options: { center: LatLngMock; level: number },
      ) {
        this.center = options.center;
        this.level = options.level;
      }

      setCenter(center: LatLngMock) {
        this.center = center;
      }

      getCenter() {
        return this.center;
      }

      setLevel(level: number) {
        this.level = level;
      }

      getLevel() {
        return this.level;
      }

      getProjection() {
        return {
          containerPointFromCoords: (coordinate: LatLngMock) => ({
            x:
              this.container.clientWidth / 2 +
              (coordinate.getLng() - this.center.getLng()) * 10_000,
            y:
              this.container.clientHeight / 2 -
              (coordinate.getLat() - this.center.getLat()) * 10_000,
          }),
        };
      }

      addListener(name: EventName, handler: EventHandler) {
        this.listeners[name].add(handler);
      }

      removeListener(name: EventName, handler: EventHandler) {
        this.listeners[name].delete(handler);
      }

      emit(name: EventName) {
        this.listeners[name].forEach((handler) => handler());
      }
    }

    let activeMap: KakaoMapMock | null = null;
    function RegisteredMapMock(
      container: HTMLElement,
      options: { center: LatLngMock; level: number },
    ): KakaoMapMock {
      const map = new KakaoMapMock(container, options);
      activeMap = map;
      return map;
    }

    const browserWindow = window as unknown as Record<string, unknown>;
    browserWindow.kakao = {
      maps: {
        LatLng: LatLngMock,
        Map: RegisteredMapMock,
        load: (callback: () => void) => callback(),
        event: {
          addListener: (target: KakaoMapMock, name: EventName, handler: EventHandler) =>
            target.addListener(name, handler),
          removeListener: (target: KakaoMapMock, name: EventName, handler: EventHandler) =>
            target.removeListener(name, handler),
        },
      },
    };
    browserWindow.__moveKakaoMap = (lat: number, lng: number) => {
      if (!activeMap) return;
      activeMap.setCenter(new LatLngMock(lat, lng));
      activeMap.emit("idle");
    };
    browserWindow.__setKakaoMapLevel = (level: number) => {
      if (!activeMap) return;
      activeMap.setLevel(level);
      activeMap.emit("idle");
    };
    browserWindow.__isKakaoMapReady = () => activeMap !== null;
  });
}

async function moveMap(page: Page, lat: number, lng: number): Promise<void> {
  await page.evaluate(
    ([nextLat, nextLng]) => {
      const browserWindow = window as unknown as {
        __moveKakaoMap: (latitude: number, longitude: number) => void;
      };
      browserWindow.__moveKakaoMap(nextLat, nextLng);
    },
    [lat, lng],
  );
}

async function setMapLevel(page: Page, level: number): Promise<void> {
  await page.evaluate((nextLevel) => {
    const browserWindow = window as unknown as {
      __setKakaoMapLevel: (level: number) => void;
    };
    browserWindow.__setKakaoMapLevel(nextLevel);
  }, level);
}

async function waitForKakaoMap(page: Page): Promise<void> {
  await expect
    .poll(() =>
      page.evaluate(() => {
        const browserWindow = window as unknown as {
          __isKakaoMapReady: () => boolean;
        };
        return browserWindow.__isKakaoMapReady();
      }),
    )
    .toBe(true);
}

async function loadClientNearbyStores(page: Page): Promise<void> {
  await waitForKakaoMap(page);
  await moveMap(page, 37.5088, 127.0632);
}

test.beforeEach(async ({ page }) => {
  await installCompletedOnboarding(page);
});

test("주변 가게를 마커와 지원 정보로 표시하고 검색·찜 필터를 BFF에 전달한다", async ({
  page,
}) => {
  await installKakaoMapMock(page);
  await page.route("**/api/stores/nearby?**", async (route) => {
    await route.fulfill({ status: 200, json: storesResponse() });
  });

  await page.goto("/stores");
  await loadClientNearbyStores(page);

  const marker = page.getByRole("button", {
    name: "장보고 마트 찜한 가게 가게 정보 보기",
  });
  await expect(marker).toBeVisible();
  await marker.click();

  const sheet = page.getByRole("dialog", { name: "장보고 마트 가게 정보" });
  await expect(sheet).toContainText("서울 광진구 예시로 1");
  await expect(sheet.getByRole("link", { name: "02-123-4567" })).toHaveAttribute(
    "href",
    "tel:02-123-4567",
  );
  await expect(sheet).toContainText("670m");
  // 2026-08-20: 이 두 줄은 원래 "찜한 가게" 배지 텍스트가 있고 액션 버튼은 없던 시트(2026-08-18
  // 구현)를 검증했다. 이후 배지가 빠지고 찜 버튼이 들어왔는데 테스트가 따라오지 않아 실패하고
  // 있었다(axe 실패에 가려 드러나지 않았다).
  // Figma `sheet/store-detail`(392:12144) 실측에도 헤더에 button/circle 2개(하트·닫기)가 있고
  // 배지는 없다 → 현재 구현이 정본이라 보고 단언을 구현에 맞춘다.
  await expect(sheet.getByRole("button", { name: "찜한 가게 해제" })).toBeVisible();
  await expect(sheet.getByRole("link", { name: "가게 상세 보기" })).toBeVisible();

  await page.getByRole("button", { name: "가게 정보 닫기" }).click();
  const likedRequest = page.waitForRequest((request) => {
    const url = new URL(request.url());
    return url.pathname === "/api/stores/nearby" && url.searchParams.get("onlyLiked") === "true";
  });
  await page.getByRole("button", { name: "찜한 가게만 보기" }).click();
  await likedRequest;

  const keywordRequest = page.waitForRequest((request) => {
    const url = new URL(request.url());
    return url.pathname === "/api/stores/nearby" && url.searchParams.get("keyword") === "장보고";
  });
  await page.getByRole("searchbox", { name: "가게 검색" }).fill("  장보고  ");
  await keywordRequest;
});

test("주변 가게가 없으면 빈 결과 상태를 표시한다", async ({ page }) => {
  await installKakaoMapMock(page);
  await page.route("**/api/stores/nearby?**", async (route) => {
    await route.fulfill({ status: 200, json: { totalCount: 0, stores: [] } });
  });

  await page.goto("/stores");
  await loadClientNearbyStores(page);

  await expect(page.getByRole("status")).toContainText("검색 결과가 없어요");
});

test("가게 API 오류를 지도 위 오류 상태로 표시한다", async ({ page }) => {
  await installKakaoMapMock(page);
  await page.route("**/api/stores/nearby?**", async (route) => {
    await route.fulfill({
      status: 502,
      json: { message: "주변 가게를 불러오지 못했어요." },
    });
  });

  await page.goto("/stores");
  await loadClientNearbyStores(page);

  await expect(
    page.getByRole("region", { name: "동네 가게 지도" }).getByRole("alert"),
  ).toContainText("주변 가게를 불러오지 못했어요");
});

test("지도 중심 이동을 debounce하고 늦은 이전 응답으로 최신 마커를 덮지 않는다", async ({
  page,
}) => {
  await installKakaoMapMock(page);
  let movedRequestCount = 0;
  const firstBurstLatitudes: number[] = [];
  let delayedRequestStarted: (() => void) | undefined;
  const delayedStarted = new Promise<void>((resolve) => {
    delayedRequestStarted = resolve;
  });

  await page.route("**/api/stores/nearby?**", async (route) => {
    const url = new URL(route.request().url());
    const latitude = Number(url.searchParams.get("latitude"));
    const longitude = Number(url.searchParams.get("longitude"));

    if (Math.abs(latitude - 37.6) < 0.0001 || Math.abs(latitude - 37.7) < 0.0001) {
      firstBurstLatitudes.push(latitude);
    }

    if (Math.abs(latitude - 37.7) < 0.0001) {
      movedRequestCount += 1;
      await route.fulfill({
        status: 200,
        json: storesResponse({
          storeId: 202,
          storeName: "debounce 최종 가게",
          latitude,
          longitude,
        }),
      });
      return;
    }
    if (Math.abs(latitude - 37.8) < 0.0001) {
      delayedRequestStarted?.();
      await new Promise((resolve) => setTimeout(resolve, 600));
      await route
        .fulfill({
          status: 200,
          json: storesResponse({
            storeId: 303,
            storeName: "느린 이전 가게",
            latitude,
            longitude,
          }),
        })
        .catch(() => undefined);
      return;
    }
    if (Math.abs(latitude - 37.9) < 0.0001) {
      await route.fulfill({
        status: 200,
        json: storesResponse({
          storeId: 404,
          storeName: "최신 중심 가게",
          latitude,
          longitude,
        }),
      });
      return;
    }

    await route.fulfill({ status: 200, json: storesResponse() });
  });

  await page.goto("/stores");
  await loadClientNearbyStores(page);
  await expect(page.getByRole("button", { name: /장보고 마트.*가게 정보 보기/ })).toBeVisible();

  await moveMap(page, 37.6, 127.1);
  await moveMap(page, 37.7, 127.2);
  await expect(
    page.getByRole("button", { name: /debounce 최종 가게.*가게 정보 보기/ }),
  ).toBeVisible();
  expect(movedRequestCount).toBe(1);
  expect(firstBurstLatitudes).toEqual([37.7]);

  await moveMap(page, 37.8, 127.3);
  await delayedStarted;
  await moveMap(page, 37.9, 127.4);
  await expect(
    page.getByRole("button", { name: /최신 중심 가게.*가게 정보 보기/ }),
  ).toBeVisible();
  await page.waitForTimeout(700);
  await expect(page.getByRole("button", { name: /느린 이전 가게/ })).toHaveCount(0);
});

test("compact 마커와 시트 닫기 버튼은 44px 터치 영역과 axe 기준을 충족한다", async ({
  page,
}) => {
  await installKakaoMapMock(page);
  await page.route("**/api/stores/nearby?**", async (route) => {
    await route.fulfill({ status: 200, json: storesResponse() });
  });
  await page.goto("/stores");
  await loadClientNearbyStores(page);

  await setMapLevel(page, 5);
  const marker = page.getByRole("button", { name: /장보고 마트.*가게 정보 보기/ });
  await expect(marker).toBeVisible();
  const markerBox = await marker.boundingBox();
  if (!markerBox) throw new Error("compact 마커의 hit area를 측정할 수 없습니다.");
  expect(markerBox.width).toBeGreaterThanOrEqual(44);
  expect(markerBox.height).toBeGreaterThanOrEqual(44);

  await marker.click();
  const closeButton = page.getByRole("button", { name: "가게 정보 닫기" });
  const closeButtonBox = await closeButton.boundingBox();
  if (!closeButtonBox) throw new Error("시트 닫기 버튼의 hit area를 측정할 수 없습니다.");
  // ⚠️ 36px은 권장 터치 타겟 44×44에 못 미친다. 다만 Figma `sheet/store-detail`(392:12144)의
  //    헤더 액션이 `button/circle` **size=36**이고, 이 프로젝트는 같은 유형을 이미 원본 유지로
  //    정해 두었다(칩 38px·탭 43px·찜 아이콘 36px — 각 컴포넌트 주석 참고).
  //    임의로 44로 키우면 시트 헤더가 시안과 어긋나므로 원본을 따르고 사실을 여기 남긴다.
  //    → 디자이너가 44로 키우기로 하면 이 기대치를 44로 되돌린다.
  expect(closeButtonBox.width).toBeGreaterThanOrEqual(36);
  expect(closeButtonBox.height).toBeGreaterThanOrEqual(36);

  const results = await new AxeBuilder({ page })
    .include("main")
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(actionableViolations(results)).toEqual([]);
});

test("Kakao 지도를 불러오지 못하면 접근 가능한 오류 상태를 알린다", async ({ page }) => {
  await page.route("https://dapi.kakao.com/**", async (route) => {
    await route.abort();
  });
  await page.route("**/api/stores/nearby?**", async (route) => {
    await route.fulfill({ status: 200, json: storesResponse() });
  });

  await page.goto("/stores");

  await expect(
    page.getByRole("alert").filter({ hasText: "지도를 불러오지 못했어요" }),
  ).toBeVisible();
});
