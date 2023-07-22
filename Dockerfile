FROM node:18-alpine

ENV HOME=/home/node

RUN apk --no-cache add autoconf automake bash g++ libtool make openjdk11-jre python3 && \
    yarn global add firebase-tools typescript && \
    yarn cache clean && \
    firebase -V && \
    java -version && \
    chown -R node:node $HOME

WORKDIR /remember-me-api
