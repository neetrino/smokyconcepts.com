/**
 * Cloudflare R2 upload service (S3-compatible API).
 * Used for product images, voting images, and other admin uploads.
 */

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
const R2_ENDPOINT = process.env.R2_ENDPOINT;
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL;

function getR2Config(): {
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  endpoint: string;
  publicUrl: string;
} | null {
  if (
    !R2_ACCESS_KEY_ID ||
    !R2_SECRET_ACCESS_KEY ||
    !R2_BUCKET_NAME ||
    !R2_ENDPOINT ||
    !R2_PUBLIC_URL
  ) {
    return null;
  }
  return {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
    bucket: R2_BUCKET_NAME,
    endpoint: R2_ENDPOINT,
    publicUrl: R2_PUBLIC_URL.replace(/\/$/, ""),
  };
}

/** Singleton S3Client — created once and reused across all uploads. */
let _s3Client: S3Client | null = null;

function getS3Client(): S3Client {
  const config = getR2Config();
  if (!config) {
    throw new Error(
      "R2 is not configured. Set R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_ENDPOINT, R2_PUBLIC_URL in .env"
    );
  }
  if (!_s3Client) {
    _s3Client = new S3Client({
      region: "auto",
      endpoint: config.endpoint,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      maxAttempts: 3,
    });
  }
  return _s3Client;
}

const R2_OBJECT_PREFIX = {
  products: "products",
  voting: "voting",
  homeHero: "home-hero",
} as const;

export type R2ImageObjectPrefix = keyof typeof R2_OBJECT_PREFIX;

/**
 * Upload a buffer to R2 and return the public URL.
 * Key format: {prefix}/YYYY/MM/uuid.ext
 */
export async function uploadImageToR2(
  body: Buffer,
  contentType: string,
  objectPrefix: R2ImageObjectPrefix
): Promise<string> {
  const config = getR2Config();
  if (!config) {
    throw new Error(
      "R2 is not configured. Set R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_ENDPOINT, R2_PUBLIC_URL in .env"
    );
  }

  const ext = contentType.includes("png")
    ? "png"
    : contentType.includes("webp")
      ? "webp"
      : "jpeg";
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const folder = R2_OBJECT_PREFIX[objectPrefix];
  const key = `${folder}/${year}/${month}/${randomUUID()}.${ext}`;

  await getS3Client().send(
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );

  return `${config.publicUrl}/${key}`;
}

/** Key format: products/YYYY/MM/uuid.ext */
export async function uploadProductImageToR2(
  body: Buffer,
  contentType: string
): Promise<string> {
  return uploadImageToR2(body, contentType, "products");
}

/** Key format: voting/YYYY/MM/uuid.ext */
export async function uploadVotingImageToR2(
  body: Buffer,
  contentType: string
): Promise<string> {
  return uploadImageToR2(body, contentType, "voting");
}

/** Key format: home-hero/YYYY/MM/uuid.ext */
export async function uploadHomeHeroImageToR2(
  body: Buffer,
  contentType: string
): Promise<string> {
  return uploadImageToR2(body, contentType, "homeHero");
}

export function isR2Configured(): boolean {
  return getR2Config() !== null;
}
