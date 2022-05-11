FROM alpine:latest
RUN apk update && apk upgrade
RUN apk add openrc npm mysql mysql-client curl && mkdir data
WORKDIR /data
ADD . / /data/

RUN rm -rf node_modules


RUN chmod +x initdb.sh && ./initdb.sh

RUN rc-update add mariadb default
RUN rc-service mariadb start

RUN npm install
ENTRYPOINT npm start

EXPOSE 3000

HEALTHCHECK --interval=2m --timeout=3s \
    CMD curl -f http://localhost:3000/ || exit 1