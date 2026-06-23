import { test, expect, APIRequestContext } from "@playwright/test";

const MAILPIT = "http://localhost:54324";

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

test.describe("password reset", () => {
  test.use({ storageState: { cookies: [], origins: [] } });
  test("reset password changes password", async ({ page, request }) => {
    const email = `${Date.now()}@u.nus.edu`;
    const username = `${Date.now()}u`;
    const password = "password123!";
    await request.post("/api/auth/register", {
      data: {
        email,
        password: password,
        confirmPassword: password,
        username: username,
      },
    });

    await page.goto("/");
    await page.getByRole("link", { name: "Reset it here!" }).click();

    await page.getByPlaceholder("e0123456@u.nus.edu").fill(email);

    await page
      .getByRole("button", { name: "Send Password Reset Link" })
      .click();
    await expect(
      page.getByText(
        "A link to reset password has been successfully sent to your email!",
      ),
    ).toBeVisible();

    await page.goto(await getResetLink(request, email));
    await page.getByRole("link", { name: "Reset Password" }).click();
    await page.getByPlaceholder("••••••••").nth(0).fill("chickenNugget123!");
    await page.getByPlaceholder("••••••••").nth(1).fill("chickenNugget123!");
    await page.getByRole("button", { name: "Update Password" }).click();
    await page.getByRole("link", { name: "Return to login page" }).click();
    await page.waitForURL("**/");

    await page.getByPlaceholder("e0123456@u.nus.edu").fill(email);
    await page.getByPlaceholder("••••••••").fill("chickenNugget123!");
    await page.getByRole("button", { name: "login" }).click();
    await page.waitForURL("**/dashboard");
  });
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
    await page.waitForURL("**/");
    await page.goto("/dashboard");
    await expect(page).not.toHaveURL(/dashboard/);
  });
});

async function getResetLink(request: APIRequestContext, email: string) {
  let html = "";
  await expect
    .poll(
      async () => {
        const res = await request.get(`${MAILPIT}/api/v1/messages`);
        const { messages } = await res.json();
        const msg = messages.find(
          (m: { ID: string; To: { Address: string }[] }) =>
            m.To.some((t: { Address: string }) => t.Address === email),
        );
        if (!msg) return false;
        html = (
          await (
            await request.get(`${MAILPIT}/api/v1/message/${msg.ID}`)
          ).json()
        ).HTML;
        return true;
      },
      { timeout: 10000 },
    )
    .toBe(true);

  const match = html.match(/href="([^"]*token_hash[^"]*)"/);
  if (!match) throw new Error("no link");
  return match[1].replace(/&amp;/g, "&");
}
