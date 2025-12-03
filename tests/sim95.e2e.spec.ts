import { test, expect } from "@playwright/test";

test("SIM95 full user flow", async ({ page }) => {
  await page.goto("/sim95/start");

  await page.getByRole("button", { name: /begin assessment/i }).click();
  await expect(page.getByText("SIM95 Questions")).toBeVisible();

  await page.getByText("1").first().click();
  await page.getByText("1").nth(1).click();

  await page.getByRole("button", { name: /submit/i }).click();

  await expect(page.getByText("Your SIM95 Report")).toBeVisible();
  await expect(page.getByText(/archetype/i)).toBeVisible();
});
