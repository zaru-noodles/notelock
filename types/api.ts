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

export type UploadRequest = {
  title: string;
  moduleId: string;
  semester: string;
  file: File | null;
  tags: number[];
};
