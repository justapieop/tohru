FROM node:20-alpine

ARG NODE_ENV
ARG MONGODB_URL
ARG DISCORD_CLIENT_ID
ARG DISCORD_DEV_GUILD_ID
ARG DISCORD_TOKEN
ARG SHARD_PER_CLUSTER

ENV NODE_ENV=${NODE_ENV}
ENV MONGODB_URL=${MONGODB_URL}
ENV DISCORD_CLIENT_ID=${DISCORD_CLIENT_ID}
ENV DISCORD_DEV_GUILD_ID=${DISCORD_DEV_GUILD_ID}
ENV DISCORD_TOKEN=${DISCORD_TOKEN}
ENV SHARD_PER_CLUSTER=${SHARD_PER_CLUSTER}

WORKDIR /usr/tohru

COPY package*.json .

RUN npm install

RUN npm run generate

COPY . .

RUN npm run build

CMD npm run start
