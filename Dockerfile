FROM node:18-alpine3.16 as builder
# install build dependencies
RUN npm install -g pnpm@7
# install app dependencies
WORKDIR /app
COPY ./package.json           ./
COPY ./pnpm-lock.yaml         ./
COPY ./pnpm-workspace.yaml    ./
COPY ./app/package.json       ./app/
COPY ./server/package.json    ./server/
COPY ./protocol/package.json  ./protocol/
RUN pnpm install --frozen-lockfile
# build the app
COPY ./tsconfig.json ./
COPY ./app/          ./app/
COPY ./server/       ./server/
COPY ./protocol/     ./protocol/
RUN NODE_ENV=production pnpm build \
    && pnpm prune --prod

FROM node:18-alpine3.16
ENV NODE_ENV=production
WORKDIR /app
COPY --from=builder /app/node_modules/          ./node_modules/
COPY --from=builder /app/app/node_modules/      ./app/node_modules/
COPY --from=builder /app/app/build/             ./app/build/
COPY --from=builder /app/app/package.json       ./app/
COPY --from=builder /app/app/server.js          ./app/
COPY --from=builder /app/server/node_modules/   ./server/node_modules/
COPY --from=builder /app/server/build/          ./server/build/
COPY --from=builder /app/server/package.json    ./server/
COPY --from=builder /app/protocol/node_modules/ ./protocol/node_modules/
COPY --from=builder /app/protocol/build/        ./protocol/build/
COPY --from=builder /app/protocol/package.json  ./protocol/
VOLUME [ "/data" ]
CMD [ "node", "/app/app/server.js" ]
