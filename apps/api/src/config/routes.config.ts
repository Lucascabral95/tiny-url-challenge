import { RequestMethod } from '@nestjs/common';

export const EXCLUDED_ROUTES = ['', 'health'];

export const EXCLUDED_ROUTES_DETAILED = [
  { path: '', method: RequestMethod.GET },
  { path: 'health', method: RequestMethod.GET },
];

export const PUBLIC_ROUTES = ['', 'health'];

export const ADMIN_ROUTES_WITHOUT_PREFIX = [];
