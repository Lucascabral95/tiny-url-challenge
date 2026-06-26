export const CREATE_URL_RATE_LIMIT = {
  keyPrefix: 'create-url',
  limit: 20,
  windowMs: 60_000,
};

export const REDIRECT_RATE_LIMIT = {
  keyPrefix: 'redirect-url',
  limit: 120,
  windowMs: 60_000,
};
