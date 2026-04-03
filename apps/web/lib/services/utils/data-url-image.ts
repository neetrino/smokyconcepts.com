/**
 * Parse a base64 data URL for an image into buffer + MIME type.
 */
export function parseDataImageUrl(
  dataUrl: string
): { buffer: Buffer; contentType: string } | null {
  const match = dataUrl.match(/^data:(image\/[a-z+]+);base64,(.+)$/s);
  if (!match) {
    return null;
  }
  const contentType = match[1];
  const base64Data = match[2];
  return {
    contentType,
    buffer: Buffer.from(base64Data, "base64"),
  };
}
