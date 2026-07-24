import { NextRequest } from 'next/server';
import { handleIdramCallback } from '@/lib/payments/idram/callback-handler';
import { parseIdramRequestBody } from '@/lib/payments/idram/parse-request-body';

export async function POST(req: NextRequest) {
  const params = await parseIdramRequestBody(req);
  return handleIdramCallback(params);
}
