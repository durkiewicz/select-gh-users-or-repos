FROM node:22-alpine AS build

ENV NPM_CONFIG_UPDATE_NOTIFIER=false
ENV NPM_CONFIG_FUND=false

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . ./

RUN npm run build-storybook

FROM caddy

WORKDIR /app

COPY Caddyfile ./

RUN caddy fmt Caddyfile --overwrite

COPY --from=build /app/storybook-static ./dist

CMD ["caddy", "run", "--config", "Caddyfile", "--adapter", "caddyfile"]
