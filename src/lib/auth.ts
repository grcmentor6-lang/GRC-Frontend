/**
 * Auth contract mirroring the FastAPI "GRC Mentor Auth API" (camelCase side).
 * Backend is snake_case; lib/api.ts converts at the boundary.
 */
import { api } from "./api";
import type { DeskIdentity } from "@/lib/desk/identity";

export interface TokenResponse {
  accessToken: string;
  tokenType?: string;
}

/** Current user (GET /me, PATCH /me, profile responses). */
export interface User {
  email: string;
  role: string;
  isProfileComplete: boolean;
  firstName: string | null;
  lastName: string | null;
  country: string | null;
  city: string | null;
  phoneCountryCode: string | null;
  phoneNumber: string | null;
  university: string | null;
  qualification: string | null;
  bio: string | null;
  linkedin: string | null;
  timezone: string;
  language: string;
  /** Chosen program start (day-0 anchor), ISO yyyy-mm-dd. Null until picked on first visit. */
  startDate: string | null;
  /** Last day new work can be submitted (start + 24wk + bonus), ISO. Null until start_date is set. */
  accessExpiresOn: string | null;
  /** Last day they may choose as their start date — signup + 1 week, ISO. Once it passes with no
   *  choice made, the backend assigns this very date as the start date. */
  startWindowEndsOn: string | null;
  /** True once the one-time LinkedIn-share access extension has been claimed. */
  linkedinShareClaimed: boolean;
  /** Holds a free GRC 101 seat. Granted at signup while seats remain under the backend's
   *  FREE_ACCESS_LIMIT, and never withdrawn once given. */
  freeAccess: boolean;
  createdAt: string;
  /** Their mentee ID and organisation names on the shared desk. Absent on an older backend. */
  deskIdentity?: DeskIdentity;
}

export interface LinkedInShareRequest {
  kind: "badge" | "certificate";
  url: string;
}

export interface SignupStartRequest {
  email: string;
  password: string;
  captchaToken: string;
  accessCode?: string;
}
export interface SignupStartResponse {
  message: string;
  email: string;
}

export interface SignupVerifyRequest {
  email: string;
  otp: string;
}
export interface SignupVerifyResponse extends TokenResponse {
  message: string;
}

export interface SignupResendOtpRequest {
  email: string;
  captchaToken: string;
}

export interface SignupProfileRequest {
  firstName: string;
  lastName: string;
  country: string;
  city?: string | null;
  phoneCountryCode: string;
  phoneNumber: string;
  university: string;
  qualification: string;
  bio?: string;
  linkedin?: string | null;
  timezone: string;
  language: string;
}

/** PATCH /me — every field optional. */
export type MePatchRequest = Partial<
  Pick<
    User,
    | "firstName"
    | "lastName"
    | "country"
    | "city"
    | "phoneCountryCode"
    | "phoneNumber"
    | "university"
    | "qualification"
    | "bio"
    | "linkedin"
    | "timezone"
    | "language"
  >
>;

export interface SigninRequest {
  email: string;
  password: string;
  captchaToken: string;
  /** Persist the session across browser restarts (persistent vs. session cookie). */
  rememberMe: boolean;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
export interface PasswordForgotRequest {
  email: string;
  captchaToken: string;
}
export interface PasswordResetRequest {
  email: string;
  otp: string;
  newPassword: string;
}

export const authApi = {
  signupStart: (b: SignupStartRequest) =>
    api.post<SignupStartResponse>("/auth/signup/start", b, { noAuth: true }),
  signupResendOtp: (b: SignupResendOtpRequest) =>
    api.post<{ message: string; email: string }>("/auth/signup/resend-otp", b, { noAuth: true }),
  signupVerifyEmail: (b: SignupVerifyRequest) =>
    api.post<SignupVerifyResponse>("/auth/signup/verify-email", b, { noAuth: true }),
  signupProfile: (b: SignupProfileRequest, token?: string) =>
    api.post<User & { message: string }>("/auth/signup/profile", b, { token }),
  signin: (b: SigninRequest) => api.post<TokenResponse>("/auth/signin", b, { noAuth: true }),
  refresh: () => api.post<TokenResponse>("/auth/refresh", undefined, { noAuth: true, noRefresh: true }),
  logout: () => api.post<void>("/auth/logout"),
  me: () => api.get<User>("/me"),
  updateMe: (b: MePatchRequest) => api.patch<User>("/me", b),
  setStartDate: (startDate: string) => api.patch<User>("/me/start-date", { startDate }),
  linkedinShare: (b: LinkedInShareRequest) => api.post<User>("/me/linkedin-share", b),
  changePassword: (b: ChangePasswordRequest) => api.post<void>("/auth/password", b),
  passwordForgot: (b: PasswordForgotRequest) =>
    api.post<{ message: string }>("/auth/password/forgot", b, { noAuth: true }),
  passwordReset: (b: PasswordResetRequest) =>
    api.post<TokenResponse>("/auth/password/reset", b, { noAuth: true }),
};

/** Password policy mirrored from the mockups + backend. */
export function passwordRules(v: string) {
  return [
    { ok: v.length >= 10, label: "At least 10 characters" },
    { ok: /[A-Z]/.test(v) && /[a-z]/.test(v), label: "Upper & lowercase letters" },
    { ok: /[0-9]/.test(v), label: "At least one number" },
    { ok: /[^A-Za-z0-9]/.test(v), label: "At least one symbol" },
  ];
}
