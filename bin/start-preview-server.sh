#!/usr/bin/env bash
# Start a static preview server without killing other pipeline ports.
# Usage: start-preview-server.sh <port> <directory>
set -euo pipefail
PORT="${1:?port required}"
DIR="${2:?directory required}"
REGISTRY="${DIR}/.preview-servers.json"

if lsof -ti:"$PORT" >/dev/null 2>&1; then
  echo "Port $PORT already in use; leaving existing server running."
  exit 0
fi

cd "$DIR"
nohup python3 -m http.server "$PORT" >/dev/null 2>&1 &
PID=$!
sleep 0.5
mkdir -p "$(dirname "$REGISTRY")"
python3 - <<PY
import json, os
from datetime import datetime, timezone
path = os.path.join("$DIR", ".preview-servers.json")
data = {"servers": []}
if os.path.isfile(path):
    with open(path) as f:
        data = json.load(f)
data.setdefault("servers", []).append({
    "port": int("$PORT"),
    "pid": int("$PID"),
    "cwd": "$DIR",
    "started_at": datetime.now(timezone.utc).isoformat(),
})
with open(path, "w") as f:
    json.dump(data, f, indent=2)
PY
echo "Preview server http://localhost:${PORT}/ (pid ${PID})"
