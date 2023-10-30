#!/bin/env bash

# Enable "strict mode":
set -euo pipefail

readonly BUILD_DIRECTORY="brainfuck"
readonly COMPILER_DIRECTORY="compiler"
readonly RUNTIME_DIRECTORY="runtime"

readonly EXECUTABLE_NAME="$COMPILER_DIRECTORY"

readonly THIS_PATH="$(realpath "$(dirname "${0}")")"

cleanup ()
{
    rm -rf "$THIS_PATH/$BUILD_DIRECTORY"
}

cleanup

trap cleanup EXIT INT TERM QUIT ERR

echo "Building runtime..."

mkdir -p "$COMPILER_DIRECTORY"

# Build the runtime:
"$RUNTIME_DIRECTORY/build.bash" clean
"$RUNTIME_DIRECTORY/build.bash" all

echo "Preparing packing..."

# Copy the compiler files:
mkdir -p "$BUILD_DIRECTORY/src"
cp -r "$COMPILER_DIRECTORY/src" "$BUILD_DIRECTORY/src"
# TODO: It is a bit ugly to copy every file individually:
cp "$COMPILER_DIRECTORY/package.json" "$BUILD_DIRECTORY/"
cp "$COMPILER_DIRECTORY/tsconfig.json" "$BUILD_DIRECTORY/"
cp "$COMPILER_DIRECTORY/tsconfig.release.json" "$BUILD_DIRECTORY/"
# Copy the runtime files:
cp -r "$RUNTIME_DIRECTORY/bin" "$BUILD_DIRECTORY/$RUNTIME_DIRECTORY"
# Copy the other files:
cp "LICENSE" "$BUILD_DIRECTORY/"
cp "README.md" "$BUILD_DIRECTORY/"

echo "Building compiler..."

# Build the compiler:
cd "$BUILD_DIRECTORY"
npm --omit=dev install
npm run build:release
rm -r src
rm package.json
rm package-lock.json
rm tsconfig.json
rm tsconfig.release.json
ln -s bin/main.js "$EXECUTABLE_NAME"
chmod +x "$EXECUTABLE_NAME"

# Pack everything:
cd ..
tar -czf "$EXECUTABLE_NAME.tgz" "$COMPILER_DIRECTORY"

echo "Build complete."
