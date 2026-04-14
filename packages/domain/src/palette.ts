const BASE_TOKENS = [
  "course.slate",
  "course.blue",
  "course.teal",
  "course.green",
  "course.olive",
  "course.amber",
  "course.rose",
  "course.purple",
];
const DEFAULT_TOKEN = "course.slate";

export function pickCourseColor(seed: number, index: number): string {
  const start = Math.abs(seed) % BASE_TOKENS.length;
  return BASE_TOKENS[(start + index) % BASE_TOKENS.length] ?? DEFAULT_TOKEN;
}

export function rotatePaletteSeed(currentSeed: number): number {
  return currentSeed + 1;
}
