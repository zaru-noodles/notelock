export type Module = {
  id: string;
  moduleCode: string;
  title: string;
  faculty: string;
  department: string;
};

export type Note = {
  id: number;
  title: string;
  semester: string;
  download_count: number;
  users: {
    username: string;
  };
};
