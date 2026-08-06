#!/usr/bin/env sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)
cd "$ROOT"

if [ "${NPM_PUBLISH_CONFIRM:-}" != "YES" ]; then
  echo "即将发布 @centralgo/cgo-ui 到公共 NPM。若确认，请设置 NPM_PUBLISH_CONFIRM=YES。" >&2
  exit 2
fi

npm run release:check
npm publish --access public --ignore-scripts
