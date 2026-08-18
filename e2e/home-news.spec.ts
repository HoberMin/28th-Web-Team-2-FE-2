import { expect, test } from "@playwright/test";

test("뉴스 API 상태와 관계없이 홈의 각 섹션을 안전하게 제공한다", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "오늘은 이 가게가 저렴해요" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "우리 동네 최저가 야채" })).toBeVisible();

  const newsSection = page.getByRole("region", { name: "최근 시세 뉴스" });
  await expect(newsSection).toBeVisible();

  const articleLinks = newsSection.getByRole("link");
  const articleCount = await articleLinks.count();

  if (articleCount === 0) {
    await expect(newsSection.getByText("아직 소식이 없어요")).toBeVisible();
    return;
  }

  for (let index = 0; index < articleCount; index += 1) {
    const articleLink = articleLinks.nth(index);
    await expect(articleLink).toHaveAttribute("href", /^https?:\/\//);
    await expect(articleLink).toHaveAttribute("target", "_blank");
    await expect(articleLink).toHaveAttribute("rel", "noopener noreferrer");
  }
});
