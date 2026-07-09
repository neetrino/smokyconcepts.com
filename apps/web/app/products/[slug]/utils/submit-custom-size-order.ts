import { apiClient, ApiError } from '@/lib/api-client';
import type { CustomOrderDraft } from '../CustomizeSizeOrderFallback';

export interface SubmitCustomSizeOrderParams {
  draft: CustomOrderDraft;
  productId?: string;
  productTitle?: string;
}

export interface SubmitCustomSizeOrderResult {
  id: string;
  number: string;
}

export async function submitCustomSizeOrder({
  draft,
  productId,
  productTitle,
}: SubmitCustomSizeOrderParams): Promise<SubmitCustomSizeOrderResult> {
  const response = await apiClient.post<{ order: SubmitCustomSizeOrderResult }>(
    '/api/v1/orders/custom-size',
    {
      name: draft.name.trim(),
      phone: draft.phone.trim(),
      email: draft.email.trim(),
      description: draft.description.trim(),
      imageDataUrl: draft.imageDataUrl.trim(),
      productId,
      productTitle,
    }
  );

  return response.order;
}

export function getCustomSizeOrderSubmitErrorMessage(error: unknown): string | null {
  if (error instanceof ApiError) {
    return error.message;
  }
  return null;
}
