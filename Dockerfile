# syntax=docker/dockerfile:1

# @napi-rs/canvas and sharp resolve a platform-specific prebuilt binary at
# install time, so every stage must share the runtime's OS and libc. Alpine
# (musl) is used deliberately: measured against a bookworm-slim build of this
# same app, it is ~75MB smaller and settles at ~90MB RSS instead of ~210MB
# under repeated /img renders. It pays for that with throughput — ~27 vs ~38
# renders/sec at concurrency 8 — which is ample here. Swapping the base means
# re-checking both native addons, since the musl and glibc builds differ.
ARG NODE_VERSION=22-alpine

FROM node:${NODE_VERSION} AS deps
WORKDIR /app
# Yarn 4 is vendored in .yarn/releases, so there is no corepack download step.
COPY .yarnrc.yml package.json yarn.lock ./
COPY .yarn/releases ./.yarn/releases
RUN node .yarn/releases/yarn-*.cjs install --immutable

FROM node:${NODE_VERSION} AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN node .yarn/releases/yarn-*.cjs build

FROM node:${NODE_VERSION} AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

# `output: 'standalone'` emits server.js plus only the traced node_modules.
# static/ and public/ are not copied into it by next build, so add them here.
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/public ./public

# next/image writes optimized variants under .next/cache at runtime.
RUN mkdir -p .next/cache && chown -R node:node .next/cache

USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/edit').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
