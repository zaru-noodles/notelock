import { describe, it, expect, vi, beforeEach } from "vitest";

import { POST } from "@/app/api/auth/logout/route";

let mockSignOutResponse: { error: { message: string } | null } = {
  error: null,
};
const mockSignOut = vi.fn(async () => mockSignOutResponse);

vi.mock("@/utils/supabase/server", () => ({
  createClient: () => ({
    auth: {
      signOut: mockSignOut,
    },
  }),
}));

vi.mock("next/headers", () => ({
  cookies: () => ({
    set: vi.fn(),
  }),
}));

function makeRequest() {
  return new Request("http://localhost/api/auth/logout", {
    method: "POST",
  });
}

describe("POST /api/auth/logout", () => {
  beforeEach(() => {
    mockSignOutResponse = { error: null };
    mockSignOut.mockClear();
  });

  it("returns 200 with success message when signOut succeeds", async () => {
    const req = makeRequest();
    const res = await POST(req as unknown as Request);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.message).toBe("Logged out");
    expect(mockSignOut).toHaveBeenCalled();
  });

  it("returns 500 when signOut returns an error", async () => {
    mockSignOutResponse = { error: { message: "test error" } };
    const req = makeRequest();
    const res = await POST(req as unknown as Request);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe("test error");
    expect(mockSignOut).toHaveBeenCalled();
  });
});
