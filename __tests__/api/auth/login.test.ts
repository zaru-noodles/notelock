import { describe, it, expect, vi, beforeEach } from "vitest";

import { POST } from "@/app/api/auth/login/route";

let mockSignInResponse: {
  data: { user: { id: string } } | null;
  error: { message: string } | null;
} = { data: null, error: null };
const mockSignIn = vi.fn(async () => mockSignInResponse);

vi.mock("next/headers", () => ({
  cookies: () => ({
    set: vi.fn(),
  }),
}));

vi.mock("@/utils/supabase/server", () => ({
  createClient: () => ({
    auth: {
      signInWithPassword: mockSignIn,
    },
  }),
}));

function makeRequest(body: Record<string, unknown>) {
  return new Request("http://localhost/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/auth/login", () => {
  beforeEach(() => {
    mockSignInResponse = { data: { user: { id: "1" } }, error: null };
    mockSignIn.mockClear();
  });

  it("returns 200 with success message on valid credentials", async () => {
    const req = makeRequest({
      email: "bob@u.nus.edu",
      password: "password1234",
    });

    const res = await POST(req as unknown as Request);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.message).toBe("Login successful");
    expect(mockSignIn).toHaveBeenCalled();
  });

  it("returns 400 when any field is missing", async () => {
    const req = makeRequest({ email: "bob@u.nus.edu" });

    const res = await POST(req as unknown as Request);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("All fields are required");
  });

  it("returns 400 when a non-NUS email is provided", async () => {
    const req = makeRequest({
      email: "bob@gmail.com",
      password: "password1234",
    });

    const res = await POST(req as unknown as Request);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Must use an NUS email");
  });

  it("returns 401 on invalid credentials", async () => {
    mockSignInResponse = { data: null, error: { message: "Invalid login" } };

    const req = makeRequest({
      email: "bob@u.nus.edu",
      password: "wrongpassword",
    });

    const res = await POST(req as unknown as Request);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Invalid login");
    expect(mockSignIn).toHaveBeenCalled();
  });
});
