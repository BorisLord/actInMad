FROM node:lts-alpine AS build

ARG MODE
ARG PUBLIC_PB_URL
ARG PB_BUILDER_EMAIL
ARG PB_BUILDER_PASSWORD

ENV MODE=${MODE}
ENV PUBLIC_PB_URL=${PUBLIC_PB_URL}
ENV PB_BUILDER_EMAIL=${PB_BUILDER_EMAIL}
ENV PB_BUILDER_PASSWORD=${PB_BUILDER_PASSWORD}

# Create docker-compose to have acces to the docker network during build to fetch articles from db
# Cree un storage pour eviter de rebuild les images

WORKDIR /app

COPY . .

RUN npm install

RUN npm run build

FROM httpd:2.4-alpine AS runtime

RUN sed -i 's/#ErrorDocument 404 \/missing.html/ErrorDocument 404 \/404.html/' /usr/local/apache2/conf/httpd.conf

COPY --from=build /app/dist /usr/local/apache2/htdocs/

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget --spider http://localhost/ || exit 1

CMD ["httpd-foreground"]
