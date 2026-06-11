FROM node:22-alpine AS base

ARG NPM_VERSION=11.6.1
RUN npm install -g npm@${NPM_VERSION}

FROM base AS dependencies

WORKDIR /app/apps/worker

COPY apps/worker/package*.json ./
RUN npm ci

FROM base AS build

WORKDIR /app/apps/worker

COPY --from=dependencies /app/apps/worker/node_modules ./node_modules
COPY apps/worker/ ./

RUN npm run build

FROM base AS runtime

ENV NODE_ENV=production

WORKDIR /app/apps/worker

COPY apps/worker/package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=build /app/apps/worker/dist ./dist

USER node

CMD ["node", "dist/main"]
