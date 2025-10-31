#!/bin/sh

# Get API_BASE from environment variable (set in Railway)
API_BASE=${API_BASE:-http://localhost:5000/api}

# Replace placeholder in index.html
sed -i "s|REPLACE_WITH_API_BASE|$API_BASE|g" /usr/share/nginx/html/index.html

# Substitute PORT and start nginx
envsubst '${PORT}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf

# Start nginx
nginx -g 'daemon off;'

