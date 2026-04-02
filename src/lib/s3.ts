import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

// Supports both AWS S3 and Cloudflare R2.
// New-style vars: S3_ENDPOINT, S3_REGION, S3_ACCESS_KEY, S3_SECRET_KEY, S3_BUCKET
// Legacy fallback: AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_BUCKET_NAME
const endpoint = process.env.S3_ENDPOINT; // R2: https://<account>.r2.cloudflarestorage.com
const region = process.env.S3_REGION ?? process.env.AWS_REGION ?? "us-east-1";
const accessKeyId =
  process.env.S3_ACCESS_KEY ?? process.env.AWS_ACCESS_KEY_ID ?? "";
const secretAccessKey =
  process.env.S3_SECRET_KEY ?? process.env.AWS_SECRET_ACCESS_KEY ?? "";
export const bucket =
  process.env.S3_BUCKET ?? process.env.AWS_BUCKET_NAME ?? "";

export const s3 = new S3Client({
  region,
  credentials: { accessKeyId, secretAccessKey },
  // forcePathStyle required for R2 and self-hosted S3-compatible stores
  ...(endpoint ? { endpoint, forcePathStyle: true } : {}),
});

/** Returns the public URL for a stored object key. */
export function getPublicUrl(key: string): string {
  if (endpoint) {
    return `${endpoint.replace(/\/$/, "")}/${bucket}/${key}`;
  }
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}

/** Upload a Buffer to S3/R2 and return its public URL. */
export async function uploadFile(
  file: Buffer,
  key: string,
  contentType: string
): Promise<string> {
  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: file,
      ContentType: contentType,
    })
  );
  return getPublicUrl(key);
}

/** Delete a file from S3/R2 by key. */
export async function deleteFile(key: string): Promise<void> {
  await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}
