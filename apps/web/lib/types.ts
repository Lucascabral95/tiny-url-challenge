export interface CreateShortUrlRequest {
  originalUrl: string;
  alias?: string;
}

export interface CreateShortUrlResponse {
  code: string;
  originalUrl: string;
  shortUrl: string;
}

export interface StatsResponse {
  code: string;
  totalClicks: number;
  lastClick: string | null;
}

export interface HealthResponse {
  status: string;
  message: string;
}
