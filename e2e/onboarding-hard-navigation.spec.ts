import { expect, test, type Page } from "@playwright/test";

const STORAGE_KEY = "veg-onboarding-v1";
const COMPLETED_STATE = JSON.stringify({
  authProvider: "kakao",
  nickname: "테스터",
  district: "광진구",
  districts: ["광진구"],
  completed: true,
  avatar: "",
});
const INCOMPLETE_STATE = JSON.stringify({
  authProvider: "",
  nickname: "",
  district: "",
  districts: [],
  completed: false,
  avatar: "",
});

async function seedOnboarding(page: Page, state: string): Promise<void> {
  await page.addInitScript(
    ({ key, value }) => {
      window.localStorage.setItem(key, value);
    },
    { key: STORAGE_KEY, value: state },
  );
}

function captureBrowserErrors(page: Page): string[] {
  const errors: string[] = [];

  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`console: ${message.text()}`);
  });
  page.on("pageerror", (error) => {
    errors.push(`pageerror: ${error.message}`);
  });

  return errors;
}

async function expectStoresReady(page: Page): Promise<void> {
  await expect(page.getByRole("status")).toBeHidden();
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        window.requestAnimationFrame(() => window.requestAnimationFrame(() => resolve()));
      }),
  );
  await expect(page).toHaveURL(/\/stores$/);
  await expect(page.getByRole("region", { name: "동네 가게 지도" })).toBeVisible();
}

test("온보딩 완료 사용자는 가게 URL로 직접 진입해도 현재 화면을 유지한다", async ({ page }) => {
  const browserErrors = captureBrowserErrors(page);
  await seedOnboarding(page, COMPLETED_STATE);

  await page.goto("/stores");

  await expectStoresReady(page);
  expect(browserErrors).toEqual([]);
});

test("온보딩 완료 사용자는 가게 화면을 새로고침해도 현재 화면을 유지한다", async ({ page }) => {
  const browserErrors = captureBrowserErrors(page);
  await seedOnboarding(page, COMPLETED_STATE);
  await page.goto("/stores");
  await expectStoresReady(page);

  await page.reload();

  await expectStoresReady(page);
  expect(browserErrors).toEqual([]);
});

test("온보딩 미완료 사용자가 가게 URL로 직접 진입하면 온보딩으로 이동한다", async ({ page }) => {
  const browserErrors = captureBrowserErrors(page);
  await seedOnboarding(page, INCOMPLETE_STATE);

  await page.goto("/stores");

  await expect(page).toHaveURL(/\/onboarding$/);
  await expect(page.getByRole("heading", { name: "우리 동네 야채 시세" })).toBeVisible();
  expect(browserErrors).toEqual([]);
});

test("온보딩 완료 사용자는 하단 메뉴로 가게 화면에 이동한다", async ({ page }) => {
  const browserErrors = captureBrowserErrors(page);
  await seedOnboarding(page, COMPLETED_STATE);
  await page.goto("/");
  await expect(page.getByRole("status")).toBeHidden();

  await page.getByRole("link", { name: "가게", exact: true }).click();

  await expectStoresReady(page);
  expect(browserErrors).toEqual([]);
});
