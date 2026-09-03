#!/bin/bash
# Fix Kotlin version mismatch between React Native (1.9.24) and Compose Compiler (1.5.15 requires 1.9.25)
# Run after npm install

set -e

KOTLIN_NEW="1.9.25"
KOTLIN_OLD="1.9.24"

fix_file() {
  local f="$1"
  if [ -f "$f" ] && grep -q "kotlin = \"$KOTLIN_OLD\"" "$f" 2>/dev/null; then
    sed -i "s/kotlin = \"$KOTLIN_OLD\"/kotlin = \"$KOTLIN_NEW\"/" "$f"
    echo "Fixed: $f"
  fi
}

fix_file "node_modules/react-native/gradle/libs.versions.toml"
fix_file "node_modules/@react-native/gradle-plugin/gradle/libs.versions.toml"

echo "Kotlin version patched to $KOTLIN_NEW"
