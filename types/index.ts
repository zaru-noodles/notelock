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
  moduleCode: string;
  downloadCount: number;
  thumbnailUrl?: string;
  username?: string;
  deletePermission: boolean;
};

export type NoteListSearchParams = {
  searchText: string;
  start: number;
  count: number;
  selectedModuleCode: string;
  selectedSemester: string;
  selectedAuthorID: string;
  sortBy: SortOrder;
};

export enum SortOrder {
  DownloadCount = "downloadCount",
  Semester = "semester",
}

export type Comments = {
  id: string;
  content: string;
  created_at: Date;
  author_id: string;
  author: { username: string };
};
