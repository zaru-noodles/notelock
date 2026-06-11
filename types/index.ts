export type Module = {
  id: string;
  moduleCode: string;
  title: string;
  faculty: string;
  department: string;
};

export type Note = {
  id: string;
  title: string;
  semester: string;
  download_count: number;
  thumbnailUrl?: string;
  username?: string;
};
