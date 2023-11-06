FROM node:16-slim

ARG _WORKDIR=/home/node/app
ARG PORT=3000

USER root
RUN apk add git

WORKDIR ${_WORKDIR}

ENV TZ="America/Sao_Paulo"

ADD . ${_WORKDIR}
RUN yarn install

USER node
EXPOSE ${PORT}

CMD yarn start