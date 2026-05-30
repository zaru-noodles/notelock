export const NOTES_BUCKET = "notes";

export function notePath(moduleCode: string, noteId: number | string) {
  return `${moduleCode}/${noteId}.pdf`;
}
