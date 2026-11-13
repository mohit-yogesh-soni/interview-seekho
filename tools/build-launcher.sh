#!/usr/bin/env bash
# runtime/Launcher.java ko compile karke runtime/launcher.jar banata hai.
# Sirf tab chalana hai jab Launcher.java badle. JDK 17+ chahiye.
set -euo pipefail
cd "$(dirname "$0")/.."
OUT="$(mktemp -d)"
javac --release 17 -Xlint:all -d "$OUT" runtime/Launcher.java runtime/Check.java
jar cf runtime/launcher.jar -C "$OUT" .
rm -rf "$OUT"
echo "Ban gaya: runtime/launcher.jar"
