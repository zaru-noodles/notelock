import { test, expect } from "@playwright/test";

test("landing page loads", async ({ page }) => {
  await page.context().clearCookies();
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Login" })).toBeVisible();
});

test("new user can register and reach dashboard", async ({ page }) => {
  await page.context().clearCookies();
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

test("an existing user can log in and reach dashboard", async ({
  page,
  request,
}) => {
  await page.context().clearCookies();
  const email = `${Date.now()}@u.nus.edu`;
  const password = "password123!";
  await request.post("/api/auth/register", {
    data: {
      email,
      password,
      confirmPassword: password,
      username: `${Date.now()}u`,
    },
  });

  await page.goto("/");
  await page.getByRole("button", { name: "Log in" }).click();
  await page.getByPlaceholder("e0123456@u.nus.edu").fill(email);
  await page.getByPlaceholder("••••••••").nth(0).fill(password);
  await page.getByRole("button", { name: "Login" }).click();
  await page.waitForURL("**/dashboard");
});

test("unauthenticated user cannot access dashboard", async ({ page }) => {
  await page.context().clearCookies();
  await page.goto("/dashboard");
  await page.waitForURL("**/");
});

test("authenticated user cannot access landing page", async ({ page }) => {
  await page.goto("/");
  await page.waitForURL("**/dashboard");
});

test.describe("logout", () => {
  test.use({ storageState: { cookies: [], origins: [] } });
  test("log out button successfully removes session", async ({ page }) => {
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

    await page.getByRole("button", { name: "log out" }).click();
    await page.goto("/dashboard");
    await page.waitForURL("**/");
  });
});
