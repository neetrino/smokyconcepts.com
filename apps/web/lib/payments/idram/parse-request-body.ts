import type { NextRequest } from 'next/server';

export async function parseIdramRequestBody(req: NextRequest): Promise<URLSearchParams> {
  const contentType = req.headers.get('content-type') ?? '';
  if (contentType.includes('application/x-www-form-urlencoded')) {
    const body = await req.text();
    return new URLSearchParams(body);
  }

  const formData = await req.formData();
  const params = new URLSearchParams();
  formData.forEach((value, key) => {
    params.set(key, String(value));
  });
  return params;
}
