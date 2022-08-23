#!/usr/bin/env sh

APP=""

case "$1" in
backend)
	APP="backend"
	;;
frontend)
	APP="frontend"
	;;
*)
	echo "Usage: $0 <backend|frontend>"
    exit 1
	;;
esac

flyctl deploy \
	--app "eligo-$APP" \
	--build-target "$APP"
