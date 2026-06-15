import { http, HttpResponse } from "msw";
import { LoginRequest } from "@/types/api";

export const handlers = [
  http.post("*/api/auth/login", async ({ request }) => {
    const { email, password } = (await request.json()) as LoginRequest;
    if (!email || !password) {
      return HttpResponse.json(
        { error: "All fields are required" },
        { status: 400 },
      );
    }
    return HttpResponse.json({ message: "Login successful" }, { status: 200 });
  }),
];
