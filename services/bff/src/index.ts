import type { JwcImportResponseDto, OcrJobStatusDto } from "@nju/contracts";

export interface BffRequestContext {
  requestId: string;
  appSession?: string;
}

export interface LoginStartRequest {
  redirectUri: string;
  clientNonce: string;
}

export interface LoginStartResponse {
  state: string;
  authorizationUrl: string;
}

export interface LoginCompleteRequest {
  state: string;
  code: string;
}

export interface LoginCompleteResponse {
  appSession: string;
  expiresIn: number;
}

export interface JwcImportRequest {
  semesterHint?: string;
  targetTimetableId: string;
}

export interface OcrJobCreateRequest {
  weekRange: string;
  timezone: string;
}

// The optional BFF can implement these handlers using any web framework.
export interface BffHandlers {
  loginStart(ctx: BffRequestContext, input: LoginStartRequest): Promise<LoginStartResponse>;
  loginComplete(ctx: BffRequestContext, input: LoginCompleteRequest): Promise<LoginCompleteResponse>;
  importJwc(ctx: BffRequestContext, input: JwcImportRequest): Promise<JwcImportResponseDto>;
  createOcrJob(ctx: BffRequestContext, input: OcrJobCreateRequest): Promise<{ jobId: string }>;
  getOcrJobStatus(ctx: BffRequestContext, jobId: string): Promise<OcrJobStatusDto>;
  getHolidays(ctx: BffRequestContext, region: string, year: number): Promise<Array<{ date: string; name: string }>>;
}
