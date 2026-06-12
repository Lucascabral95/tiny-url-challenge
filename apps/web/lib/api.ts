import type {
  CreateShortUrlRequest,
  CreateShortUrlResponse,
  HealthResponse,
  StatsResponse,
} from "./types";

interface ApiErrorBody {
  message?: string | string[];
  error?: string;
  statusCode?: number;
}

export class ApiClientError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

const fallbackApiUrl = "http://localhost:3000";

function getApiBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_API_URL ?? fallbackApiUrl).replace(/\/$/, "");
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${getApiBaseUrl()}${path}`, {
      ...init,
      cache: "no-store",
    });
  } catch (error) {
    throw new ApiClientError(
      "No se pudo conectar con la API. Verifica que el backend este levantado.",
      undefined,
      error,
    );
  }

  const responseBody = await readResponseBody(response);

  if (!response.ok) {
    throw new ApiClientError(
      getFriendlyErrorMessage(response.status, responseBody),
      response.status,
      responseBody,
    );
  }

  return responseBody as T;
}

async function readResponseBody(response: Response): Promise<unknown> {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function getFriendlyErrorMessage(status: number, body: unknown): string {
  if (status === 400) {
    return getBodyMessage(body) ?? "Revisa los datos ingresados.";
  }

  if (status === 404) {
    return "No se encontro informacion para ese codigo.";
  }

  if (status === 409) {
    return "Ese alias o codigo ya existe. Elegi otro.";
  }

  if (status >= 500) {
    return "La API tuvo un problema. Reintenta en unos segundos.";
  }

  return getBodyMessage(body) ?? "Ocurrio un error inesperado.";
}

function getBodyMessage(body: unknown): string | undefined {
  if (!isApiErrorBody(body)) {
    return undefined;
  }

  if (Array.isArray(body.message)) {
    return body.message.join(" ");
  }

  return body.message ?? body.error;
}

function isApiErrorBody(value: unknown): value is ApiErrorBody {
  return typeof value === "object" && value !== null;
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiClientError) {
    return error.message;
  }

  return "Ocurrio un error inesperado.";
}

export function createShortUrl(
  payload: CreateShortUrlRequest,
): Promise<CreateShortUrlResponse> {
  return request<CreateShortUrlResponse>("/api/v1/urls", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export function getStats(code: string): Promise<StatsResponse> {
  return request<StatsResponse>(`/api/v1/stats/${encodeURIComponent(code)}`);
}

export function getHealth(): Promise<HealthResponse> {
  return request<HealthResponse>("/health");
}
