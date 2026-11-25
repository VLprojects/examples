FROM node:24-alpine AS build
WORKDIR /app
COPY package.json yarn.lock ./
COPY client/package.json client/
COPY server/package.json server/
RUN yarn install --frozen-lockfile
COPY client client
RUN yarn workspace client build

FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json yarn.lock ./
COPY client/package.json client/
COPY server/package.json server/
RUN yarn install --frozen-lockfile --production && yarn cache clean
COPY server/src server/src
COPY --from=build /app/client/dist client/dist
USER node
EXPOSE 3000
CMD ["node", "server/src/index.ts"]
