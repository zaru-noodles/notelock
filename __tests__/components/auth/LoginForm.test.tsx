import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginForm from "@/app/components/auth/LoginForm";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe("LoginForm", () => {
  it("shows an error when fields are left blank", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.click(screen.getByRole("button", { name: "Login" }));

    expect(
      await screen.findByText("All fields are required"),
    ).toBeInTheDocument();
  });

  it("has to be an nus email", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText("NUS EMAIL"), "zarufox@gmail.com");
    await user.type(screen.getByLabelText("PASSWORD"), "password1234");
    await user.click(screen.getByRole("button", { name: "Login" }));

    expect(
      await screen.findByText("Must use an NUS email"),
    ).toBeInTheDocument();
  });

  it("is a successful login", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText("NUS EMAIL"), process.env.TEST_USER!);
    await user.type(
      screen.getByLabelText("PASSWORD"),
      process.env.TEST_PASSWORD!,
    );
    await user.click(screen.getByRole("button", { name: "Login" }));

    expect(mockPush).toHaveBeenCalledWith("/dashboard");
  });
});
