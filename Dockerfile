FROM node:16-alpine3.16 as builder
# install build dependencies
RUN npm install -g pnpm \
    && apk --no-cache add --virtual builds-deps build-base python3
# install app dependencies
WORKDIR /app
COPY ./package.json           ./
COPY ./pnpm-lock.yaml         ./
COPY ./pnpm-workspace.yaml    ./
COPY ./backend/package.json   ./backend/
COPY ./frontend/package.json  ./frontend/
COPY ./protocol/package.json  ./protocol/
RUN pnpm install --frozen-lockfile
# build the app
COPY ./tsconfig.json ./
COPY ./backend/      ./backend/
COPY ./frontend/     ./frontend/
COPY ./protocol/     ./protocol/
ENV NODE_ENV=production
RUN pnpm build \
    && pnpm prune --prod

FROM node:16-alpine3.16 as frontend
ENV NODE_ENV=production
ENV PORT=8080
WORKDIR /app
COPY --from=builder /app/node_modules/          ./node_modules/
COPY --from=builder /app/frontend/node_modules/ ./frontend/node_modules/
COPY --from=builder /app/frontend/build/        ./frontend/build/
COPY --from=builder /app/frontend/package.json  ./frontend/
CMD [ "node", "/app/frontend/build/index.js" ]

FROM node:16-alpine3.16 as backend
ENV NODE_ENV=production
WORKDIR /app
COPY --from=builder /app/node_modules/          ./node_modules/
COPY --from=builder /app/protocol/node_modules/ ./protocol/node_modules/
COPY --from=builder /app/protocol/build/        ./protocol/build/
COPY --from=builder /app/protocol/package.json  ./protocol/
COPY --from=builder /app/backend/node_modules/  ./backend/node_modules/
COPY --from=builder /app/backend/build/         ./backend/build/
COPY --from=builder /app/backend/package.json   ./backend/
VOLUME [ "/data/database.json" ]
CMD [ "node", "/app/backend/build/index.js", "--host", "0.0.0.0", "--port", "8080", "--database", "/data/database.json" ]
