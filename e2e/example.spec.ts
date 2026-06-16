import { test, expect } from "@playwright/test";

test("landing page loads", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Login" })).toBeVisible();
});

test("creating an account works", async ({ page }) => {
  await page.goto("/");
});
