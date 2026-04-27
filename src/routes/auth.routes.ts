import { Router } from "express";
import * as AuthController from "@controllers/auth.controller";
import { validateBody } from "@middlewares/validate";
import { requireAuth, requireRefreshCookie } from "@middlewares/auth";
import { csrfGuard } from "@middlewares/csrf";
import { loginSchema, registerSchema } from "@validators/auth.schema";

const router = Router();

router.post("/register", validateBody(registerSchema), AuthController.register);
router.post("/login", validateBody(loginSchema), AuthController.login);
router.post("/refresh", requireRefreshCookie, csrfGuard, AuthController.refresh);
router.post("/logout", requireRefreshCookie, csrfGuard, AuthController.logout);
router.get("/me", requireAuth, AuthController.me);

export default router;
