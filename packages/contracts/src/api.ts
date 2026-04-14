import type { CourseDraftDto } from "./course";

export interface ImportWarning {
  code: string;
  message: string;
}

export interface JwcImportResponseDto {
  courses: CourseDraftDto[];
  warnings: ImportWarning[];
  parserVersion?: string;
}

export interface OcrJobStatusDto {
  jobId: string;
  status: "pending" | "running" | "done" | "failed";
  progress?: number;
  result?: {
    courses: CourseDraftDto[];
    warnings: ImportWarning[];
  };
  errorMessage?: string;
}
