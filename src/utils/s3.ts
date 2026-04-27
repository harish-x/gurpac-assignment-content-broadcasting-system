import { PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";
import s3 from "@config/s3";
import Secrets from "@config/secrets";

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
};

const SIGNED_URL_TTL_SECONDS = 3600;

export function buildContentKey(mime: string): string {
  const ext = EXT_BY_MIME[mime] ?? "bin";
  const now = new Date();
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  return `content/${yyyy}/${mm}/${randomUUID()}.${ext}`;
}

export async function uploadBuffer(key: string, body: Buffer, contentType: string): Promise<void> {
  await s3.send(
    new PutObjectCommand({
      Bucket: Secrets.S3_BUCKET_NAME,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );
}

export async function deleteObject(key: string): Promise<void> {
  await s3.send(
    new DeleteObjectCommand({
      Bucket: Secrets.S3_BUCKET_NAME,
      Key: key,
    }),
  );
}

export async function signedUrlFor(key: string, expiresIn = SIGNED_URL_TTL_SECONDS): Promise<string> {
  const command = new GetObjectCommand({ Bucket: Secrets.S3_BUCKET_NAME, Key: key });
  return getSignedUrl(s3, command, { expiresIn });
}
