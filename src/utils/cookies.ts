import { CookieOptions, Response } from "express";
import Secrets from "@config/secrets";

export const REFRESH_COOKIE = "refresh_token";
export const CSRF_COOKIE = "XSRF-TOKEN";

const REFRESH_PATH = "/api/auth";

function baseCookieOpts(): CookieOptions {
  return {
    secure: Secrets.COOKIE_SECURE,
    sameSite: "strict",
    domain: Secrets.COOKIE_DOMAIN || undefined,
  };
}

export function setRefreshCookie(res: Response, token: string, ttlMs: number): void {
  res.cookie(REFRESH_COOKIE, token, {
    ...baseCookieOpts(),
    httpOnly: true,
    path: REFRESH_PATH,
    maxAge: ttlMs,
  });
}

export function setCsrfCookie(res: Response, token: string, ttlMs: number): void {
  res.cookie(CSRF_COOKIE, token, {
    ...baseCookieOpts(),
    httpOnly: false,
    path: "/",
    maxAge: ttlMs,
  });
}

export function clearAuthCookies(res: Response): void {
  res.clearCookie(REFRESH_COOKIE, { ...baseCookieOpts(), httpOnly: true, path: REFRESH_PATH });
  res.clearCookie(CSRF_COOKIE, { ...baseCookieOpts(), httpOnly: false, path: "/" });
}
