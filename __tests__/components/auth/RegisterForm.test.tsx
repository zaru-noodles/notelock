import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RegisterForm from "@/app/components/auth/RegisterForm";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe("RegisterForm", () => {
  (it("shows an error when fields are left blank", async () => {
    const user = userEvent.setup();
    render(<RegisterForm setLoginInfomation={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "Create an account" }));

    expect(
      await screen.findByText("All fields are required"),
    ).toBeInTheDocument();
  }),
    it("has to be an nus email", async () => {
      const user = userEvent.setup();
      render(<RegisterForm setLoginInfomation={vi.fn()} />);

      await user.type(screen.getByLabelText("NUS EMAIL"), "zarufox@gmail.com");
      await user.type(screen.getByLabelText("PASSWORD"), "password123");
      await user.type(
        screen.getByLabelText("CONFIRM PASSWORD"),
        "password1234",
      );
      await user.type(screen.getByLabelText("USERNAME"), "Zaru");

      await user.click(
        screen.getByRole("button", { name: "Create an account" }),
      );

      expect(
        await screen.findByText("Must use an NUS email"),
      ).toBeInTheDocument();
    }));
});
