# stage1 as builder
FROM node:10-alpine as builder

# copy the package.json to install dependencies
COPY . /build

WORKDIR /build

# Install the dependencies and make the folder
RUN npm install && npm run build

FROM nginx:alpine

ARG PORT=8080

RUN set -ex; \
    echo "\
    worker_processes 4; \
    events { worker_connections 1024; } \
    http { \
    server { \
        listen $PORT; \
        root  /usr/share/nginx/html; \
        include /etc/nginx/mime.types; \
    }}" >  /etc/nginx/nginx.conf; \
    rm -rf /usr/share/nginx/html/*

# Copy from the stahg 1
COPY --from=builder /build/build/ /usr/share/nginx/html

EXPOSE $PORT

ENTRYPOINT ["nginx", "-g", "daemon off;"]