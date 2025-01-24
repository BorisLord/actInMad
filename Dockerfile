FROM node:lts AS build

WORKDIR /app

COPY . .

RUN npm install

RUN npm run build

FROM httpd:2.4 AS runtime

RUN apt-get update && apt-get install -y curl wget && apt-get clean

COPY --from=build /app/dist /usr/local/apache2/htdocs/

COPY httpd.conf /usr/local/apache2/conf/httpd.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

CMD ["httpd-foreground"]
