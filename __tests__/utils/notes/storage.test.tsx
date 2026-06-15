import { expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import { notePath } from "@/utils/notes/storage";

test("notePath correctly forms URL to storage bucket", () => {
  expect(notePath("CS2040S", "12345677")).toBe("CS2040S/12345677.pdf");
});
