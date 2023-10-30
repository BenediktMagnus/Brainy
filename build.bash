#!/bin/env bash

# Enable "strict mode":
set -euo pipefail

readonly BUILD_DIRECTORY="build"
readonly COMPILER_DIRECTORY="compiler"
readonly RUNTIME_DIRECTORY="runtime"

readonly THIS_PATH="$(realpath "$(dirname "${0}")")"

cleanup ()
{
    rm -rf "$THIS_PATH/$BUILD_DIRECTORY"
}

cleanup

trap cleanup EXIT INT TERM QUIT ERR

echo "Building runtime..."

# Build the runtime:
"$RUNTIME_DIRECTORY/build.bash" clean
"$RUNTIME_DIRECTORY/build.bash" all

# Copy the compiler files:
cp -r "$COMPILER_DIRECTORY" "$BUILD_DIRECTORY"
rm "$BUILD_DIRECTORY/$RUNTIME_DIRECTORY"
# Copy the runtime files:
cp -r "$RUNTIME_DIRECTORY/bin" "$BUILD_DIRECTORY/$RUNTIME_DIRECTORY"
# Copy the other files:
cp "LICENSE" "$BUILD_DIRECTORY/"
cp "README.md" "$BUILD_DIRECTORY/"

echo "Building compiler..."

# Build everything:
cd "$BUILD_DIRECTORY"
npm pack --pack-destination ".."

echo "Build complete."
