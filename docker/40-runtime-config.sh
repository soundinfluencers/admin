#!/bin/sh
set -eu

: "${API_URL:?API_URL must be set to the public backend URL}"

case "$API_URL" in
  http://*|https://*) ;;
  *)
    echo "API_URL must start with http:// or https://" >&2
    exit 1
    ;;
esac

escaped_api_url="$(printf '%s' "$API_URL" | sed 's/\\/\\\\/g; s/"/\\"/g')"

printf 'window.RUNTIME_CONFIG = Object.freeze({ API_URL: "%s" });\n' \
  "$escaped_api_url" \
  > /usr/share/nginx/html/runtime-config.js
