FROM node:lts-alpine AS build

ARG MODE

ENV MODE=${MODE}

WORKDIR /app

COPY . .

RUN npm install

RUN npm run build

FROM httpd:2.4-alpine AS runtime

RUN apk add --no-cache curl wget

RUN sed -i 's/#ErrorDocument 404 \/missing.html/ErrorDocument 404 \/404.html/' /usr/local/apache2/conf/httpd.conf

COPY --from=build /app/dist /usr/local/apache2/htdocs/

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

CMD ["httpd-foreground"]
