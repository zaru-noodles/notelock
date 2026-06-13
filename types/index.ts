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

export type Comments = {
  id: string;
  content: string;
  created_at: Date;
  author_id: string;
  author: { username: string };
};
