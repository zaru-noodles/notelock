export const AuthLevel = { USER: 0, PROFESSOR: 1, ADMIN: 2 } as const;

export function authLevelLabel(level: number) {
  switch (level) {
    case AuthLevel.PROFESSOR:
      return "Professor";
    case AuthLevel.ADMIN:
      return "Admin";
    default:
      return "Student";
  }
}
