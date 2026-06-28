import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginForm from "@/app/components/auth/LoginForm";
import AuthCard from "@/app/components/landing-page/AuthCard";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const server = setupServer(
  http.post("/api/auth/login", () =>
    HttpResponse.json({ message: "Login successful" }, { status: 200 }),
  ),
);
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("LoginForm", () => {
  it("renders email and password inputs, submit button, and forgot password link", () => {
    render(<LoginForm />);

    expect(screen.getByLabelText("NUS EMAIL")).toBeInTheDocument();
    expect(screen.getByLabelText("PASSWORD")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Login" })).toBeInTheDocument();

    const resetLink = screen.getByRole("link", { name: /Reset it here!/i });
    expect(resetLink).toBeInTheDocument();
    expect(resetLink).toHaveAttribute("href", "/reset-password");
  });

  it("shows a register/signup toggle present in the AuthCard", () => {
    render(<AuthCard />);

    expect(
      screen.getByRole("button", { name: /Sign up/i }),
    ).toBeInTheDocument();
  });

  it("client side validation shows error for empty fields", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);
    await user.click(screen.getByRole("button", { name: "Login" }));

    expect(
      await screen.findByText("All fields are required"),
    ).toBeInTheDocument();
  });

  it("client side validation shows error for non-NUS email", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(
      screen.getByLabelText("NUS EMAIL"),
      "invalid-email@gmail.com",
    );
    await user.type(screen.getByLabelText("PASSWORD"), "password1234");
    await user.click(screen.getByRole("button", { name: "Login" }));

    expect(
      await screen.findByText("Must use an NUS email"),
    ).toBeInTheDocument();
  });

  it("able to display error message from the API", async () => {
    server.use(
      http.post("/api/auth/login", () =>
        HttpResponse.json({ error: "test error" }, { status: 401 }),
      ),
    );
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText("NUS EMAIL"), "e10101010@u.nus.edu");
    await user.type(screen.getByLabelText("PASSWORD"), "password1234");
    await user.click(screen.getByRole("button", { name: "Login" }));

    expect(await screen.findByText("test error")).toBeInTheDocument();
  });

  it("is a successful login", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText("NUS EMAIL"), "zarufox@u.nus.edu");
    await user.type(screen.getByLabelText("PASSWORD"), "password1234");
    await user.click(screen.getByRole("button", { name: "Login" }));

    expect(mockPush).toHaveBeenCalledWith("/dashboard");
  });
});
