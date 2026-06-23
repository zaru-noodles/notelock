import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RegisterForm from "@/app/components/auth/RegisterForm";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

const server = setupServer(
  http.post("/api/auth/register", () =>
    HttpResponse.json({ message: "Registration successful" }, { status: 200 }),
  ),
);
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

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
    }),
    it("has to have the same password", async () => {
      const user = userEvent.setup();
      render(<RegisterForm setLoginInfomation={vi.fn()} />);

      await user.type(screen.getByLabelText("NUS EMAIL"), "zarufox@u.nus.edu");
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
        await screen.findByText("Passwords do not match"),
      ).toBeInTheDocument();
    }));

  it("it passes credentials up on a successful sign-up", async () => {
    const user = userEvent.setup();
    const setLoginInfomation = vi.fn();
    render(<RegisterForm setLoginInfomation={setLoginInfomation} />);

    await user.type(screen.getByLabelText("NUS EMAIL"), "zarufox@u.nus.edu");
    await user.type(screen.getByLabelText("PASSWORD"), "password1234");
    await user.type(screen.getByLabelText("CONFIRM PASSWORD"), "password1234");
    await user.type(screen.getByLabelText("USERNAME"), "Zaru");

    await user.click(screen.getByRole("button", { name: "Create an account" }));
    await waitFor(() => {
      expect(setLoginInfomation).toHaveBeenCalledWith({
        email: "zarufox@u.nus.edu",
        password: "password1234",
      });
    });
  });
});
