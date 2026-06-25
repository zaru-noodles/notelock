import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PendingVerificationTextbox from "@/app/components/auth/PendingVerificationTextbox";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const server = setupServer(
  http.post("/api/auth/login", () =>
    HttpResponse.json({ error: "Login unsuccessful" }, { status: 401 }),
  ),
  http.post("/api/auth/resendVerification", () =>
    HttpResponse.json({ message: "Verification email sent" }, { status: 200 }),
  ),
);
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const loginRequest = {
  email: "",
  password: "",
};

describe("PendingVerificationTextbox", () => {
  it("renders message and resend link button", () => {
    render(<PendingVerificationTextbox loginRequest={loginRequest} />);

    expect(
      screen.getByRole("button", { name: "Resend verification link" }),
    ).toBeInTheDocument();
  });

  it("able to display success message from the API", async () => {
    const user = userEvent.setup();
    render(<PendingVerificationTextbox loginRequest={loginRequest} />);

    await user.click(
      screen.getByRole("button", { name: "Resend verification link" }),
    );

    expect(
      await screen.findByText("Verification email sent"),
    ).toBeInTheDocument();
  });

  it("able to display error message from the API", async () => {
    server.use(
      http.post("/api/auth/resendVerification", () =>
        HttpResponse.json({ error: "test error" }, { status: 401 }),
      ),
    );
    const user = userEvent.setup();
    render(<PendingVerificationTextbox loginRequest={loginRequest} />);

    await user.click(
      screen.getByRole("button", { name: "Resend verification link" }),
    );

    expect(await screen.findByText("test error")).toBeInTheDocument();
  });

  it("displays success message and link on successful password reset request", async () => {
    server.use(
      http.post("/api/auth/login", () =>
        HttpResponse.json({ message: "Login successful" }, { status: 200 }),
      ),
    );
    render(<PendingVerificationTextbox loginRequest={loginRequest} />);
    await waitFor(
      () => {
        expect(mockPush).toHaveBeenCalledWith("/dashboard");
      },
      { timeout: 10000 },
    );
  });
});
