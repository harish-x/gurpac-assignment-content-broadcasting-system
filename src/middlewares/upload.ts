import multer, { FileFilterCallback } from "multer";
import { Request } from "express";

export const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/gif"]);
export const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB

function fileFilter(_req: Request, file: Express.Multer.File, cb: FileFilterCallback) {
  if (!ALLOWED_MIME.has(file.mimetype)) {
    return cb(new Error(`Unsupported file type: ${file.mimetype}. Allowed: jpg, png, gif`));
  }
  cb(null, true);
}

export const uploadSingle = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_BYTES, files: 1 },
  fileFilter,
}).single("file");
