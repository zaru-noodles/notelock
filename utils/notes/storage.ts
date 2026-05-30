export const NOTES_BUCKET = "notes";

export function notePath(moduleCode: string, noteId: string) {
  return `${moduleCode}/${noteId}.pdf`;
}
