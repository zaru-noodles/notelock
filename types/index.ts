export type Module = {
  id: string;
  moduleCode: string;
  title: string;
  faculty: string;
  department: string;
  notes?: {
    count: number;
  };
};

export type Note = {
  id: string;
  title: string;
  semester: string;
  moduleCode: string;
  downloadCount: number;
  upvoteCount: number;
  downvoteCount: number;
  thumbnailUrl?: string;
  userId?: string;
  username?: string;
  deletePermission: boolean;
  tags?: Tag[];
  totalCount: number;
};

export type NoteListSearchParams = {
  searchText: string;
  start: number;
  count: number;
  selectedModuleCode: string;
  selectedSemester: string;
  selectedAuthorID: string;
  sortBy: SortOrder;
  tagIds: number[];
};

export enum SortOrder {
  DownloadCount = "downloadCount",
  Semester = "semester",
  Rating = "rating",
}

export type Comments = {
  id: string;
  content: string;
  created_at: Date;
  author_id: string;
  author: { username: string };
};

export type Tag = {
  id: number;
  label: string;
};

export type Binder = {
  id: string;
  title: string;
};
