FROM postgres:14
FROM node:20

WORKDIR /app
COPY package.json .
RUN yarn install
COPY . .
CMD yarn test:lint
CMD yarn start
