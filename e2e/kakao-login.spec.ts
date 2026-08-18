import { expect, test } from "@playwright/test";

test.describe("카카오 로그인 경계", () => {
  test("로그인 취소는 민감정보 없이 온보딩 오류로 돌아온다", async ({ page }) => {
    const browserErrors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") browserErrors.push(message.text());
    });
    page.on("pageerror", (error) => browserErrors.push(error.message));
    await page.route("**/api/auth/kakao/start", async (route) => {
      await route.fulfill({ status: 302, headers: { Location: "/onboarding?loginError=cancelled" } });
    });

    await page.goto("/onboarding");
    await page.getByRole("button", { name: "카카오로 시작하기" }).click();

    await expect(page).toHaveURL(/\/onboarding\?loginError=cancelled$/);
    await expect(page.getByText("카카오 로그인을 취소했어요.", { exact: true })).toBeVisible();
    expect(page.url()).not.toContain("token");
    expect(browserErrors).toEqual([]);
  });

  test("auth 쿼리만 위조해서는 로그인 단계를 통과하지 못한다", async ({ page }) => {
    await page.goto("/onboarding?auth=kakao");

    await expect(page.getByRole("button", { name: "카카오로 시작하기" })).toBeVisible();
    await expect(page.getByRole("heading", { name: /사용할 닉네임/ })).toHaveCount(0);
  });

  test("httpOnly 서비스 세션이 있을 때만 실제 닉네임 단계와 10자 계약을 사용한다", async ({
    context,
    page,
  }) => {
    await context.addCookies([
      {
        name: "mg_access_token",
        value: "eyJhbGciOiJub25lIn0.eyJleHAiOjQxMDI0NDQ4MDB9.signature",
        domain: "127.0.0.1",
        path: "/",
        httpOnly: true,
        sameSite: "Lax",
      },
    ]);
    await page.goto("/onboarding");

    await expect(page.getByRole("heading", { name: /사용할 닉네임/ })).toBeVisible();
    const input = page.getByRole("textbox", { name: "닉네임" });
    await input.fill("장보고테스트12345");
    await expect(input).toHaveValue("장보고테스트1234");
    await input.fill("공백 닉네임");
    await expect(page.locator("#nickname-error")).toContainText("한글, 영문, 숫자만");
  });

  test("새 계정 로그인 신호는 이전 계정의 완료 상태보다 우선한다", async ({ context, page }) => {
    await context.addCookies([
      {
        name: "mg_access_token",
        value: "eyJhbGciOiJub25lIn0.eyJleHAiOjQxMDI0NDQ4MDB9.signature",
        domain: "127.0.0.1",
        path: "/",
        httpOnly: true,
        sameSite: "Lax",
      },
      {
        name: "mg_kakao_login_transition",
        value: "fresh-account",
        domain: "127.0.0.1",
        path: "/onboarding",
        httpOnly: true,
        sameSite: "Lax",
      },
    ]);
    await page.addInitScript(() => {
      window.localStorage.setItem(
        "veg-onboarding-v1",
        JSON.stringify({
          authProvider: "kakao",
          nickname: "이전계정",
          district: "화양동",
          regionId: "1121510700",
          regionName: "서울특별시 광진구 화양동",
          districts: ["화양동"],
          completed: true,
          avatar: "",
        }),
      );
    });

    await page.goto("/onboarding?freshLogin=fresh-account");

    await expect(page).toHaveURL(/\/onboarding$/);
    await expect(page.getByRole("heading", { name: /사용할 닉네임/ })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "닉네임" })).toHaveValue("");
  });
});
