#!/bin/bash

PORT=8080


if [[ -z "$(command -v nginx)" ]] ; then
  echo "install nginx"
  sudo apt-get update
  sudo apt-get install -yq nginx
fi

echo -e "$( nginx -v )"

echo "\
worker_processes 4; \
events { worker_connections 1024; } \
http { \
server { \
    listen $PORT; \
    root  /usr/share/nginx/html; \
    include /etc/nginx/mime.types; \
}}" | sudo tee /etc/nginx/nginx.conf > /dev/null

sudo rm -rf /usr/share/nginx/html/*

sudo service nginx restart
