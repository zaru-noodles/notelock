import { describe, it, expect, vi, beforeEach } from "vitest";

import { POST } from "@/app/api/auth/resendVerification/route";

let mockResendResponse: { error: { message: string } | null } = { error: null };
const mockResend = vi.fn(async () => mockResendResponse);
vi.mock("@/utils/supabase/server", () => ({
  createClient: () => ({
    auth: {
      resend: mockResend,
    },
  }),
}));

vi.mock("@/utils/api/helper", () => ({
  getOriginURL: async () => "http://localhost",
}));

vi.mock("next/headers", () => ({
  cookies: () => ({
    set: vi.fn(),
  }),
}));

function makeRequest(body: Record<string, unknown>) {
  return new Request("http://localhost/api/auth/resendVerification", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/auth/resendVerification", () => {
  beforeEach(() => {
    mockResendResponse = { error: null };
    mockResend.mockClear();
  });

  it("returns 200 with success message when email provided", async () => {
    const req = makeRequest({ email: "alice@u.nus.edu" });
    const res = await POST(req as unknown as Request);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.message).toBe("Verification link sent!");
    expect(mockResend).toHaveBeenCalled();
  });

  it("returns 400 when email is missing", async () => {
    const req = makeRequest({});
    const res = await POST(req as unknown as Request);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("All fields are required");
  });

  it("returns 500 when Supabase resend returns an error", async () => {
    mockResendResponse = { error: { message: "test error" } };
    const req = makeRequest({ email: "alice@u.nus.edu" });
    const res = await POST(req as unknown as Request);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe("test error");
    expect(mockResend).toHaveBeenCalled();
  });
});
