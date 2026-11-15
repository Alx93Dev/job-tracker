FROM node:24-alpine AS build
RUN apk add --no-cache openssl && corepack enable
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/
COPY apps/api/prisma apps/api/prisma
RUN pnpm install --frozen-lockfile --filter api
COPY apps/api apps/api
RUN pnpm --filter api build

FROM node:24-alpine
RUN apk add --no-cache openssl
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build --chown=node:node /app /app
WORKDIR /app/apps/api
USER node
EXPOSE 4000
# Pending migrations are applied on every start; `migrate deploy` never resets data.
CMD ["sh", "-c", "node_modules/.bin/prisma migrate deploy && node dist/main"]
