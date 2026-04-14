import type { Course, CourseDraftDto } from "@nju/contracts";
import { finalizeCourseFromDraft, validateCourseForSave } from "./course";
import { pickCourseColor } from "./palette";

export interface ImportDraftPayload {
  timetableId: string;
  drafts: CourseDraftDto[];
  paletteSeed: number;
}

export interface ImportResult {
  accepted: Course[];
  rejected: Array<{ draft: CourseDraftDto; errors: string[] }>;
}

export function applyImportDrafts(payload: ImportDraftPayload): ImportResult {
  const accepted: Course[] = [];
  const rejected: Array<{ draft: CourseDraftDto; errors: string[] }> = [];

  payload.drafts.forEach((draft, index) => {
    const validation = validateCourseForSave(draft);
    if (!validation.ok) {
      rejected.push({ draft, errors: validation.errors });
      return;
    }
    accepted.push(
      finalizeCourseFromDraft(
        draft,
        payload.timetableId,
        pickCourseColor(payload.paletteSeed, index),
      ),
    );
  });

  return { accepted, rejected };
}
