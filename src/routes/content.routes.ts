import { NextFunction, Request, Response, Router } from "express";
import { StatusCodes } from "http-status-codes";
import * as ContentController from "@controllers/content.controller";
import { requireAuth, requireRole } from "@middlewares/auth";
import { csrfGuard } from "@middlewares/csrf";
import { uploadSingle } from "@middlewares/upload";
import { validateBody, validateQuery } from "@middlewares/validate";
import {
  createContentSchema,
  listMineQuerySchema,
  listAllQuerySchema,
  rejectContentSchema,
} from "@validators/content.schema";
import ErrorHandler from "@utils/errorhandler";
import multer from "multer";

const router = Router();

router.get("/live/:teacherId", ContentController.getLive);

function multerErrorHandler(err: unknown, _req: Request, _res: Response, next: NextFunction) {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return next(new ErrorHandler("File too large (max 10MB)", StatusCodes.BAD_REQUEST));
    }
    return next(new ErrorHandler(err.message, StatusCodes.BAD_REQUEST));
  }
  if (err instanceof Error) {
    return next(new ErrorHandler(err.message, StatusCodes.BAD_REQUEST));
  }
  next(err);
}

router.post(
  "/",
  requireAuth,
  requireRole("teacher"),
  csrfGuard,
  (req, res, next) => uploadSingle(req, res, (err) => (err ? multerErrorHandler(err, req, res, next) : next())),
  validateBody(createContentSchema),
  ContentController.upload,
);

router.get("/mine", requireAuth, requireRole("teacher"), validateQuery(listMineQuerySchema), ContentController.listMine);

router.get("/", requireAuth, requireRole("principal"), validateQuery(listAllQuerySchema), ContentController.listAll);

router.patch("/:id/approve", requireAuth, requireRole("principal"), csrfGuard, ContentController.approveContent);

router.patch(
  "/:id/reject",
  requireAuth,
  requireRole("principal"),
  csrfGuard,
  validateBody(rejectContentSchema),
  ContentController.rejectContent,
);

export default router;
