import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RegisterForm from "@/app/components/auth/RegisterForm";
import AuthCard from "@/app/components/landing-page/AuthCard";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const server = setupServer(
  http.post("/api/auth/register", () =>
    HttpResponse.json({ message: "Registration successful" }, { status: 200 }),
  ),
);
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("RegisterForm", () => {
  it("renders email and password inputs, submit button, and forgot password link", () => {
    render(<RegisterForm setLoginInfomation={vi.fn()} />);

    expect(screen.getByLabelText("NUS EMAIL")).toBeInTheDocument();
    expect(screen.getByLabelText("PASSWORD")).toBeInTheDocument();
    expect(screen.getByLabelText("CONFIRM PASSWORD")).toBeInTheDocument();
    expect(screen.getByLabelText("USERNAME")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Create an account" }),
    ).toBeInTheDocument();
  });

  it("shows a login toggle present in the AuthCard", () => {
    render(<AuthCard />);

    expect(screen.getByRole("button", { name: "Log in" })).toBeInTheDocument();
  });

  it("client side validation shows an error when fields are left blank", async () => {
    const user = userEvent.setup();
    render(<RegisterForm setLoginInfomation={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "Create an account" }));

    expect(
      await screen.findByText("All fields are required"),
    ).toBeInTheDocument();
  });

  it("client side validation shows an error when the email is not an NUS email", async () => {
    const user = userEvent.setup();
    render(<RegisterForm setLoginInfomation={vi.fn()} />);

    await user.type(screen.getByLabelText("NUS EMAIL"), "zarufox@gmail.com");
    await user.type(screen.getByLabelText("PASSWORD"), "password123");
    await user.type(screen.getByLabelText("CONFIRM PASSWORD"), "password1234");
    await user.type(screen.getByLabelText("USERNAME"), "Zaru");

    await user.click(screen.getByRole("button", { name: "Create an account" }));

    expect(
      await screen.findByText("Must use an NUS email"),
    ).toBeInTheDocument();
  });

  it("client side validation shows an error when the passwords do not match", async () => {
    const user = userEvent.setup();
    render(<RegisterForm setLoginInfomation={vi.fn()} />);

    await user.type(screen.getByLabelText("NUS EMAIL"), "zarufox@u.nus.edu");
    await user.type(screen.getByLabelText("PASSWORD"), "password123");
    await user.type(screen.getByLabelText("CONFIRM PASSWORD"), "password1234");
    await user.type(screen.getByLabelText("USERNAME"), "Zaru");

    await user.click(screen.getByRole("button", { name: "Create an account" }));

    expect(
      await screen.findByText("Passwords do not match"),
    ).toBeInTheDocument();
  });

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

  it("displays API error message on registration failure", async () => {
    server.use(
      http.post("/api/auth/register", () =>
        HttpResponse.json({ error: "test error" }, { status: 401 }),
      ),
    );
    const user = userEvent.setup();
    render(<RegisterForm setLoginInfomation={vi.fn()} />);

    await user.type(screen.getByLabelText("NUS EMAIL"), "zarufox@u.nus.edu");
    await user.type(screen.getByLabelText("PASSWORD"), "password1234");
    await user.type(screen.getByLabelText("CONFIRM PASSWORD"), "password1234");
    await user.type(screen.getByLabelText("USERNAME"), "Zaru");

    await user.click(screen.getByRole("button", { name: "Create an account" }));
    expect(await screen.findByText("test error")).toBeInTheDocument();
  });
});
