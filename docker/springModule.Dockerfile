FROM java:openjdk-8-jdk-alpine

ARG PORT=8080
ARG IP=0.0.0.0
ARG MODULE
ARG DEPLOY_FOLDER="/var/kanbanboard"

ENV APP_ROOT=$DEPLOY_FOLDER
ENV APP_FILE=$MODULE
ENV LISTEN_PORT=$PORT
ENV LISTEN_IP=$IP

COPY . $DEPLOY_FOLDER

ENTRYPOINT java -Dserver.port=$LISTEN_PORT -Dserver.address=$LISTEN_IP -Djava.security.egd=file:/dev/./urandom -jar "$APP_ROOT/$APP_FILE"

EXPOSE $PORT


