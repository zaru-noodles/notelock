import { test, expect } from "@playwright/test";

test("landing page loads", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Login" })).toBeVisible();
});

test("new user can register and reach dashboard", async ({ page }) => {
  const email = `${Date.now()}@u.nus.edu`;
  const username = `${Date.now()}u`;
  const password = "password123!";

  await page.goto("/");

  await page.getByRole("button", { name: "Sign up" }).click();
  await page.getByPlaceholder("e0123456@u.nus.edu").fill(email);
  await page.getByPlaceholder("••••••••").nth(0).fill(password);
  await page.getByPlaceholder("••••••••").nth(1).fill(password);
  await page.getByPlaceholder("Zaru").fill(username);

  await page.getByRole("button", { name: "Create an account" }).click();

  await page.waitForURL("**/dashboard");
});
