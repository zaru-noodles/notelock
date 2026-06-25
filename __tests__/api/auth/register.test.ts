import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/auth/register/route";

let mockCountResponse: { count: number; error: { message: string } | null } = {
  count: 0,
  error: null,
};
const mockCount = vi.fn(async () => mockCountResponse);
let mockSignUpResponse: { error: { message: string } | null } = { error: null };
const mockSignUp = vi.fn(async () => mockSignUpResponse);

vi.mock("@/utils/supabase/server", () => ({
  createClient: () => ({
    from: () => ({
      select: () => ({
        eq: mockCount,
      }),
    }),
    auth: {
      signUp: mockSignUp,
    },
  }),
}));

vi.mock("next/headers", () => ({
  cookies: () => ({
    set: vi.fn(),
  }),
}));

vi.mock("@/utils/api/helper", () => ({
  getOriginURL: async () => "http://localhost",
}));

function makeRequest(body: Record<string, unknown>) {
  return new Request("http://localhost/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/auth/register", () => {
  beforeEach(() => {
    mockCountResponse = { count: 0, error: null };
    mockCount.mockClear();
    mockSignUpResponse = { error: null };
    mockSignUp.mockClear();
  });

  it("returns 200 with success message when all fields are valid", async () => {
    const req = makeRequest({
      email: "alice@u.nus.edu",
      password: "password1234",
      confirmPassword: "password1234",
      username: "alice",
    });

    const res = await POST(req as unknown as Request);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.message).toMatch(/Registration successful/i);
    expect(mockCount).toHaveBeenCalled();
    expect(mockSignUp).toHaveBeenCalled();
  });

  it("returns 400 when any field is missing", async () => {
    const req = makeRequest({
      email: "alice@u.nus.edu",
      password: "password1234",
    });

    const res = await POST(req as unknown as Request);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("All fields are required");
  });

  it("returns 400 when a non-NUS email is provided", async () => {
    const req = makeRequest({
      email: "alice@gmail.com",
      password: "password1234",
      confirmPassword: "password1234",
      username: "alice",
    });

    const res = await POST(req as unknown as Request);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Must use an NUS email");
  });

  it("returns 400 when passwords do not match", async () => {
    const req = makeRequest({
      email: "alice@u.nus.edu",
      password: "password123",
      confirmPassword: "password456",
      username: "alice",
    });

    const res = await POST(req as unknown as Request);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Passwords do not match");
  });

  it("returns 400 when username is already taken", async () => {
    mockCountResponse = { count: 1, error: null };

    const req = makeRequest({
      email: "alice@u.nus.edu",
      password: "password1234",
      confirmPassword: "password1234",
      username: "alice",
    });

    const res = await POST(req as unknown as Request);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Username already used");
    expect(mockCount).toHaveBeenCalled();
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it("returns 401 when sign-up fails", async () => {
    mockSignUpResponse = { error: { message: "Sign-up failed" } };

    const req = makeRequest({
      email: "alice@u.nus.edu",
      password: "password1234",
      confirmPassword: "password1234",
      username: "alice",
    });

    const res = await POST(req as unknown as Request);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Sign-up failed");
    expect(mockCount).toHaveBeenCalled();
    expect(mockSignUp).toHaveBeenCalled();
  });
});
