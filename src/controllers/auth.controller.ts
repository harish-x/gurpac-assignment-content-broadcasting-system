import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { warning, error } from "@utils/logger";
import * as AuthService from "@services/auth.service";
import catchAsyncError from "@middlewares/catchAsyncError";
import { setCsrfCookie, setRefreshCookie, clearAuthCookies, REFRESH_COOKIE } from "@utils/cookies";

export {};

function clientMeta(req: Request) {
  return {
    ua: req.get("user-agent") ?? undefined,
    ip: req.ip,
  };
}

function respondWithBundle(res: Response, status: number, bundle: Awaited<ReturnType<typeof AuthService.login>>) {
  setRefreshCookie(res, bundle.refreshToken, bundle.refreshTtlMs);
  setCsrfCookie(res, bundle.csrfToken, bundle.refreshTtlMs);
  return res.status(status).json({
    success: true,
    user: bundle.user,
    accessToken: bundle.accessToken,
    csrfToken: bundle.csrfToken,
  });
}

export const register = catchAsyncError(async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;
  const { ua, ip } = clientMeta(req);
  warning(`Register attempt: ${email} from ${ip}`);
  const bundle = await AuthService.register(name, email, password, role, ua, ip);
  return respondWithBundle(res, StatusCodes.CREATED, bundle);
});

export const login = catchAsyncError(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const { ua, ip } = clientMeta(req);
  warning(`Login attempt: ${email} from ${ip}`);
  const bundle = await AuthService.login(email, password, ua, ip);
  return respondWithBundle(res, StatusCodes.OK, bundle);
});

export const refresh = catchAsyncError(async (req: Request, res: Response) => {
  const token = req.cookies?.[REFRESH_COOKIE];
  const { ua, ip } = clientMeta(req);
  const bundle = await AuthService.refresh(token, ua, ip);
  return respondWithBundle(res, StatusCodes.OK, bundle);
});

export const logout = catchAsyncError(async (req: Request, res: Response) => {
  const token = req.cookies?.[REFRESH_COOKIE];
  await AuthService.logout(token);
  clearAuthCookies(res);
  warning(`Logout from ${req.ip}`);
  return res.status(StatusCodes.OK).json({ success: true });
});

export const me = catchAsyncError(async (req: Request, res: Response) => {
  const user = await AuthService.me(req.user!.sub);
  return res.status(StatusCodes.OK).json({ success: true, user });
});
