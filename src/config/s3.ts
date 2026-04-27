import { S3Client } from "@aws-sdk/client-s3";
import Secrets from "./secrets";

const s3 = new S3Client({
  region: Secrets.AWS_REGION,
  credentials: {
    accessKeyId: Secrets.AWS_ACCESS_KEY_ID,
    secretAccessKey: Secrets.AWS_SECRET_ACCESS_KEY,
  },
});

export default s3;
