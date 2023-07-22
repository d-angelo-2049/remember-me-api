FROM node:18-alpine

ENV HOME=/home/node

EXPOSE 8081
EXPOSE 5002
EXPOSE 5001
EXPOSE 9000
EXPOSE 8082
EXPOSE 8085


RUN apk --no-cache add autoconf automake bash g++ libtool make openjdk11-jre python3 && \
    yarn global add firebase-tools typescript && \
    yarn cache clean && \
    firebase -V && \
    java -version && \
    chown -R node:node $HOME

WORKDIR /remember-me-api
