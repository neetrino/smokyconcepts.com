import { getArcaConfig } from './config';

export async function postArcaForm<TResponse>(
  endpoint: string,
  payload: Record<string, string>,
): Promise<TResponse> {
  const config = getArcaConfig();
  const body = new URLSearchParams(payload);
  const response = await fetch(`${config.baseUrl}/${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Arca API request failed with status ${response.status}`);
  }

  return (await response.json()) as TResponse;
}

export async function postAmeriaJson<TResponse>(
  endpoint: string,
  payload: Record<string, string | number>,
): Promise<TResponse> {
  const config = getArcaConfig();
  const response = await fetch(`${config.baseUrl}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Ameria API request failed with status ${response.status}`);
  }

  return (await response.json()) as TResponse;
}
