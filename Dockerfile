FROM node:18-alpine

ARG NODE_ENV
ARG MONGODB_URL
ARG MONGODB_DBNAME
ARG DISCORD_CLIENT_ID
ARG DISCORD_DEV_GUILD_ID
ARG DISCORD_TOKEN
ARG SHARD_PER_CLUSTER

ENV NODE_ENV=${NODE_ENV}
ENV MONGODB_URL=${MONGODB_URL}
ENV MONGODB_DBNAME=${MONGODB_DBNAME}
ENV DISCORD_CLIENT_ID=${DISCORD_CLIENT_ID}
ENV DISCORD_DEV_GUILD_ID=${DISCORD_DEV_GUILD_ID}
ENV DISCORD_TOKEN=${DISCORD_TOKEN}
ENV SHARD_PER_CLUSTER=${SHARD_PER_CLUSTER}

WORKDIR /usr/tohru

COPY package*.json .

RUN npm install

COPY . .

RUN npm run build

CMD npm run start
