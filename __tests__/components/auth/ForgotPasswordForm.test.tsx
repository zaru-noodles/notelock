import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginForm from "@/app/components/auth/LoginForm";
import AuthCard from "@/app/components/landing-page/AuthCard";
import ForgotPasswordForm from "@/app/components/auth/ForgotPasswordForm";
import { createClient } from "@supabase/supabase-js";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockResetPassword = vi.fn();
vi.mock("@/utils/supabase/client", () => ({
  createClient: () => ({
    auth: {
      resetPasswordForEmail: mockResetPassword,
    },
  }),
}));

beforeEach(() => {
  mockResetPassword.mockResolvedValue({ error: null });
});

describe("ForgotPasswordForm", () => {
  it("renders email input and submit button", () => {
    render(<ForgotPasswordForm />);

    expect(screen.getByLabelText("EMAIL")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Send Password Reset Link" }),
    ).toBeInTheDocument();
  });

  it("client side validation shows error for empty fields", async () => {
    const user = userEvent.setup();
    render(<ForgotPasswordForm />);
    await user.click(
      screen.getByRole("button", { name: "Send Password Reset Link" }),
    );

    expect(
      await screen.findByText("All fields are required"),
    ).toBeInTheDocument();
  });

  it("client side validation shows error for non-NUS email", async () => {
    const user = userEvent.setup();
    render(<ForgotPasswordForm />);

    await user.type(screen.getByLabelText("EMAIL"), "invalid-email@gmail.com");
    await user.click(
      screen.getByRole("button", { name: "Send Password Reset Link" }),
    );

    expect(
      await screen.findByText("Must use an NUS email"),
    ).toBeInTheDocument();
  });

  it("able to display error message from the API", async () => {
    mockResetPassword.mockResolvedValue({ error: { message: "test error" } });
    const user = userEvent.setup();
    render(<ForgotPasswordForm />);

    await user.type(screen.getByLabelText("EMAIL"), "e10101010@u.nus.edu");
    await user.click(
      screen.getByRole("button", { name: "Send Password Reset Link" }),
    );

    expect(await screen.findByText("test error")).toBeInTheDocument();
  });

  it("displays success message and link on successful password reset request", async () => {
    const user = userEvent.setup();
    render(<ForgotPasswordForm />);

    await user.type(screen.getByLabelText("EMAIL"), "zarufox@u.nus.edu");
    await user.click(
      screen.getByRole("button", { name: "Send Password Reset Link" }),
    );

    const successMessage = await screen.findByText(
      "A link to reset password has been successfully sent to your email!",
    );
    expect(successMessage).toBeInTheDocument();

    const resetLink = screen.getByRole("link", {
      name: /Return to login page/i,
    });
    expect(resetLink).toBeInTheDocument();
    expect(resetLink).toHaveAttribute("href", "/");
  });
});
