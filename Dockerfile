FROM node:20-alpine AS base

FROM base AS builder
WORKDIR /app
COPY package.json yarn.lock .yarnrc.yml ./
RUN yarn set version stable
RUN yarn install
COPY . .

EXPOSE 3000

CMD yarn test:lint
CMD yarn start
