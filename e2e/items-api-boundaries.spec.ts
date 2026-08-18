import { expect, test, type Page } from "@playwright/test";

async function seedCompletedOnboarding(page: Page): Promise<void> {
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

test("서버 지역 쿠키가 없으면 외부 API 대신 필요한 설정을 안내한다", async ({ page }) => {
  await seedCompletedOnboarding(page);

  await page.goto("/prices");

  await expect(page.getByText("동네 정보가 필요해요")).toBeVisible();
  await expect(page.getByText("온보딩에서 동네를 선택하면 주변 시세를 볼 수 있어요.")).toBeVisible();
});

test("인증 쿠키가 없으면 찜한 야채 API를 호출하지 않고 로그인 필요를 안내한다", async ({
  page,
}) => {
  await seedCompletedOnboarding(page);

  await page.goto("/saved?tab=vegetable");

  await expect(page.getByText("로그인이 필요해요")).toBeVisible();
  await expect(page.getByText("카카오 로그인 후 찜한 야채를 모아볼 수 있어요.")).toBeVisible();
});
