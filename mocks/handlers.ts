import { http, HttpResponse } from "msw";
import { LoginRequest, RegisterRequest } from "@/types/api";

export const handlers = [
  http.post("/api/auth/login", async ({ request }) => {
    const { email, password } = (await request.json()) as LoginRequest;
    if (!email || !password) {
      return HttpResponse.json(
        { error: "All fields are required" },
        { status: 400 },
      );
    }
    if (!email.endsWith("@u.nus.edu")) {
      return HttpResponse.json(
        { error: "Must use an NUS email" },
        { status: 400 },
      );
    }
    return HttpResponse.json(
      {
        message: "Login successful",
      },
      { status: 200 },
    );
  }),
  http.post("/api/auth/register", async ({ request }) => {
    const { email, password, confirmPassword, username } =
      (await request.json()) as RegisterRequest;
    console.log(email, password, confirmPassword, username);
    if (!email || !password || !confirmPassword || !username) {
      return HttpResponse.json(
        { error: "All fields are required" },
        { status: 400 },
      );
    }

    if (!email.endsWith("@u.nus.edu")) {
      return HttpResponse.json(
        { error: "Must use an NUS email" },
        { status: 400 },
      );
    }

    if (password !== confirmPassword) {
      return HttpResponse.json(
        { error: "Passwords do not match" },
        { status: 400 },
      );
    }
    return HttpResponse.json(
      {
        message:
          "Registration successful, please check your email to verify your account",
      },
      { status: 200 },
    );
  }),
];
