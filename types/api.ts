export type RegisterRequest = {
  email: string;
  password: string;
  confirmPassword: string;
  username: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};
