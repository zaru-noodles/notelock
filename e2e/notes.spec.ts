import { test, expect } from "@playwright/test";
import path from "path";

test("upload a note, find note, add a comment and delete it", async ({
  page,
}) => {
  const title = `Lecture Test Notes ${Date.now()}`;

  await page.goto("/dashboard");
  await page
    .getByRole("navigation")
    .getByRole("link", { name: "Upload notes" })
    .click();
  await page.getByRole("textbox", { name: "Enter note title" }).fill(title);

  const semester = page.getByRole("textbox", { name: "Semester" });
  await semester.click();
  await semester.fill("25/26 S");
  await page.getByText("25/26 S1").click();

  const moduleCode = page.getByRole("textbox", { name: "Module", exact: true });
  await moduleCode.click();
  await moduleCode.fill("CS2040S");
  await page.getByText("CS2040S Data Structures and").click();

  await page
    .getByRole("button", { name: "Note File" })
    .setInputFiles(path.join(__dirname, "testnotes/test.pdf"));

  await page.getByRole("button", { name: "Upload" }).click();

  await expect(page.getByText("Note uploaded. Thank you!")).toBeVisible();

  const search = page.getByRole("textbox", { name: "Search for modules..." });
  await search.click();
  await search.fill("CS2040S");
  await page.getByText("CS2040S Data Structures and").click();

  await page.waitForURL("**/notes/CS2040S");

  const thumbnail = page
    .getByRole("img", { name: "Missing thumbnail" })
    .first();
  await expect(thumbnail).toBeVisible();
  await page
    .getByRole("heading", { name: "Lecture Test Notes" })
    .first()
    .click();

  const comment = page.getByRole("textbox", { name: "Add a comment..." });
  await comment.click();
  const commentTime = Date.now();
  await comment.fill(`This is a test comment run by playwright ${commentTime}`);

  await page.getByRole("button", { name: "Comment" }).click();

  await expect(
    page.getByText(`This is a test comment run by playwright ${commentTime}`),
  ).toBeVisible();

  await page
    .getByRole("listitem")
    .filter({
      hasText: `This is a test comment run by playwright ${commentTime}`,
    })
    .getByRole("button")
    .click();

  await expect(
    page.getByText(`This is a test comment run by playwright ${commentTime}`),
  ).toHaveCount(0);
});
