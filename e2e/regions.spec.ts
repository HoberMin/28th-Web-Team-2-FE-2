import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const ONBOARDING_STORAGE_KEY = "veg-onboarding-v1";
const SEARCH_DEBOUNCE_WAIT_MS = 450;

async function prepareRegionStep(
  page: Page,
  geolocationErrorCode: 1 | 3 | null = null,
): Promise<void> {
  await page.addInitScript(
    ({ errorCode, storageKey }) => {
      window.localStorage.setItem(
        storageKey,
        JSON.stringify({
          authProvider: "kakao",
          nickname: "테스터",
          district: "",
          regionId: "",
          regionName: "",
          districts: [],
          completed: false,
          avatar: "",
        }),
      );

      Object.defineProperty(navigator, "geolocation", {
        configurable: true,
        value: {
          getCurrentPosition(
            success: PositionCallback,
            error: PositionErrorCallback,
          ): void {
            if (errorCode !== null) {
              const locationError: GeolocationPositionError = {
                code: errorCode,
                message: errorCode === 1 ? "permission denied" : "timeout",
                PERMISSION_DENIED: 1,
                POSITION_UNAVAILABLE: 2,
                TIMEOUT: 3,
              };
              error(locationError);
              return;
            }

            const coords: GeolocationCoordinates = {
              latitude: 37.5796,
              longitude: 126.967,
              accuracy: 10,
              altitude: null,
              altitudeAccuracy: null,
              heading: null,
              speed: null,
            };
            success({ coords, timestamp: Date.now() });
          },
        },
      });
    },
    { errorCode: geolocationErrorCode, storageKey: ONBOARDING_STORAGE_KEY },
  );

  if (geolocationErrorCode === null) {
    await page.route("**/api/regions/nearby?*", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          { regionId: "0111010100", regionName: "서울특별시 종로구 청운동" },
        ]),
      }),
    );
  }

  await page.goto("/onboarding");
  await expect(page.getByRole("heading", { name: /평소 어디에서/ })).toBeVisible();
}

test("두 글자 미만 검색어는 BFF를 호출하지 않는다", async ({ page }) => {
  const keywords: string[] = [];
  await page.route("**/api/regions/search?*", async (route) => {
    keywords.push(new URL(route.request().url()).searchParams.get("keyword") ?? "");
    await route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
  });
  await prepareRegionStep(page);

  await page.getByRole("textbox", { name: "동 단위로 지역 검색" }).fill("동");
  await expect(page.getByText("동 이름을 두 글자 이상 입력해 주세요.")).toBeVisible();
  await page.waitForTimeout(SEARCH_DEBOUNCE_WAIT_MS);

  expect(keywords).toEqual([]);
});

test("늦게 끝난 이전 검색 결과가 최신 결과를 덮지 않는다", async ({ page }) => {
  const keywords: string[] = [];
  await page.route("**/api/regions/search?*", async (route) => {
    const keyword = new URL(route.request().url()).searchParams.get("keyword") ?? "";
    keywords.push(keyword);
    if (keyword === "성성동") {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
    const region =
      keyword === "성성동"
        ? { regionId: "4413310500", regionName: "충청남도 천안시 서북구 성성동" }
        : { regionId: "0111010100", regionName: "서울특별시 종로구 청운동" };
    try {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([region]),
      });
    } catch {
      // 새 검색이 시작되며 이전 요청이 abort된 경우다.
    }
  });
  await prepareRegionStep(page);

  const search = page.getByRole("textbox", { name: "동 단위로 지역 검색" });
  await search.fill("성성동");
  await expect.poll(() => keywords.includes("성성동")).toBe(true);
  await search.fill("청운동");

  await expect(page.getByRole("button", { name: "서울특별시 종로구 청운동" })).toBeVisible();
  await expect(page.getByRole("button", { name: /성성동/ })).toHaveCount(0);
});

test("빈 결과와 400·5xx 오류를 각각 안내한다", async ({ page }) => {
  await page.route("**/api/regions/search?*", async (route) => {
    const keyword = new URL(route.request().url()).searchParams.get("keyword") ?? "";
    if (keyword === "없는동") {
      await route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
      return;
    }
    const status = keyword === "오류동" ? 400 : 502;
    await route.fulfill({
      status,
      contentType: "application/json",
      body: JSON.stringify({
        message:
          status === 400
            ? "검색어가 올바르지 않아요."
            : "동네를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.",
      }),
    });
  });
  await prepareRegionStep(page);

  const search = page.getByRole("textbox", { name: "동 단위로 지역 검색" });
  await search.fill("없는동");
  await expect(page.getByText("검색 결과가 없어요.")).toBeVisible();

  await search.fill("오류동");
  await expect(page.getByText("검색어가 올바르지 않아요.", { exact: true })).toBeVisible();

  await search.fill("장애동");
  await expect(
    page.getByText("동네를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.", {
      exact: true,
    }),
  ).toBeVisible();
});

for (const scenario of [
  { code: 1 as const, label: "위치 권한 거부" },
  { code: 3 as const, label: "위치 확인 timeout" },
]) {
  test(`${scenario.label} 시 검색 가능한 안내 상태를 유지한다`, async ({ page }) => {
    await prepareRegionStep(page, scenario.code);
    await expect(
      page.getByText("현재 위치를 확인하지 못했어요. 동 이름으로 검색해 주세요.", {
        exact: true,
      }),
    ).toBeVisible();
    await expect(page.getByRole("textbox", { name: "동 단위로 지역 검색" })).toBeEnabled();
  });
}

test("선택한 label과 10자리 regionId를 로컬 상태와 서버 쿠키에 함께 보존한다", async ({
  context,
  page,
}) => {
  await page.route("**/api/regions/search?*", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([
        { regionId: "0111010100", regionName: "서울특별시 종로구 청운동" },
      ]),
    }),
  );
  await prepareRegionStep(page);

  await page.getByRole("textbox", { name: "동 단위로 지역 검색" }).fill("청운동");
  await page.getByRole("button", { name: "서울특별시 종로구 청운동" }).click();

  const accessibility = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(accessibility.violations).toEqual([]);

  await page.getByRole("button", { name: "확인" }).click();
  await expect(page).toHaveURL(/\/$/);

  const onboarding = await page.evaluate((storageKey) => {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return null;
    return parsed;
  }, ONBOARDING_STORAGE_KEY);
  expect(onboarding).toMatchObject({
    district: "청운동",
    regionId: "0111010100",
    regionName: "서울특별시 종로구 청운동",
    completed: true,
  });

  const cookies = await context.cookies();
  expect(cookies.find((cookie) => cookie.name === "mg_region_id")?.value).toBe("0111010100");
  const regionNameCookie = cookies.find((cookie) => cookie.name === "mg_region_name");
  expect(regionNameCookie).toBeDefined();
  expect(decodeURIComponent(regionNameCookie?.value ?? "")).toBe("서울특별시 종로구 청운동");
});
