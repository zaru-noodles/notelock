import { test } from "@playwright/test";
import { randomUUID } from "crypto";

const authFile = "e2e/.auth/user.json";

test("authenticate", async ({ page }) => {
  const email = `${randomUUID()}@u.nus.edu`;
  const username = `${randomUUID()}u`;
  const password = "password123!";

  await page.goto("/");
  await page.getByRole("button", { name: "Sign up" }).click();
  await page.getByPlaceholder("e0123456@u.nus.edu").fill(email);
  await page.getByPlaceholder("••••••••").nth(0).fill(password);
  await page.getByPlaceholder("••••••••").nth(1).fill(password);
  await page.getByPlaceholder("Zaru").fill(username);
  await page.getByRole("button", { name: "Create an account" }).click();
  await page.waitForURL("**/dashboard");

  await page.context().storageState({ path: authFile });
});
