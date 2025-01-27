#!/bin/bash
set -e
cd "$(dirname $0)"

TARGET="${CARGO_TARGET_DIR:-target}"

# Add the WebAssembly target platform
rustup target add wasm32-unknown-unknown

# Build the project for the specified target
echo "Building the project..."
cargo build --target wasm32-unknown-unknown --profile app-release

# Create the 'res' folder
mkdir -p res

# Set the project name directly to 'chat_app'
sanitized_name="chat_app"

# Define the full path to the WASM file
WASM_FILE="$TARGET/wasm32-unknown-unknown/app-release/$sanitized_name.wasm"

# Check if the WASM file exists and copy it to the 'res' folder
if [ -f "$WASM_FILE" ]; then
  echo "WASM file found: $WASM_FILE"
  cp "$WASM_FILE" ./res/
else
  echo "Error: $WASM_FILE not found! There might be an issue with the build process."
  exit 1
fi

# Optimize the WASM file if 'wasm-opt' is available
if command -v wasm-opt >/dev/null; then
  echo "Optimizing with wasm-opt..."
  wasm-opt -Oz ./res/$sanitized_name.wasm -o ./res/$sanitized_name.wasm
else
  echo "wasm-opt not found, skipping optimization."
fi
