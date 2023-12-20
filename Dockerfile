FROM node:19-alpine

ARG _WORKDIR=/home/node/app
ARG PORT=3000

USER root
RUN apk add git

WORKDIR ${_WORKDIR}

ENV NODE_ENV="production"
ENV TZ="America/Sao_Paulo"

ADD . ${_WORKDIR}
RUN yarn install

USER node
EXPOSE ${PORT}

CMD yarn start