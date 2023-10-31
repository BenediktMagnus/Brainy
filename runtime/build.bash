#!/bin/env bash

# Enable "strict mode":
set -euo pipefail

# Constant definitions:
readonly SOURCE_DIRECTORY="src"
readonly OBJECT_DIRECTORY="obj"
readonly BINARY_DIRECTORY="bin"

# Functions:

function clean
{
    rm -rf "$OBJECT_DIRECTORY"
    rm -rf "$BINARY_DIRECTORY"

    echo "Cleaned up."
}

function targetLinuxAmd64
{
    local targetName="linuxAmd64"

    prepare "$targetName"

    local objectFiles=()

    local commandGcc=(
        'gcc'
        '-nostdinc'
        '-fno-stack-protector'
        '-fdata-sections'
        '-ffunction-sections'
        '-fno-builtin'
        '-fno-asynchronous-unwind-tables'
        '-fno-ident'
        '-finhibit-size-directive'
        '-masm=intel'
        '-O2'
        '-c'
        '-o'
    )

    # Common files
    compileSubdirectory "common" "c" "o" objectFiles "${commandGcc[@]}"
    # Linux Amd64 files
    compileSubdirectory "$targetName" "c" "o" objectFiles "${commandGcc[@]}"

    packLibrary "$targetName" "${objectFiles[@]}"
}

# Compile the contents of a subdirectory with the given compile command.
function compileSubdirectory
{
    local targetSubdirectory=$1
    local inputFileExtension=$2
    local outputFileExtension=$3
    local -n outputFiles=$4
    shift 4
    local command=("${@}")

    local sourceDirectory="$SOURCE_DIRECTORY/$targetSubdirectory"

    for sourceFile in $sourceDirectory/*.$inputFileExtension ; do
        # Check if this is really a file and otherwise skip the loop:
        if ! [ -f $sourceFile ]; then
            continue
        fi

        local baseFileName=$(basename "$sourceFile" .$inputFileExtension)
        local outputFile="$OBJECT_DIRECTORY/$targetSubdirectory/$baseFileName.$outputFileExtension"

        outputFiles+=("$outputFile")

        "${command[@]}" "$outputFile" "$sourceFile"
    done
}

# Pack the given object files into a linkable library.
function packLibrary
{
    local targetName=$1
    shift 1
    local objectFiles=("${@}")

    local targetFile="$BINARY_DIRECTORY/$targetName/runtime.a"

    ar crs "$targetFile" ${objectFiles[@]}
}

function prepare
{
    local targetName="$1"

    mkdir -p "$OBJECT_DIRECTORY/common"
    mkdir -p "$OBJECT_DIRECTORY/$targetName"
    mkdir -p "$BINARY_DIRECTORY/$targetName"

    # TODO: Should we clean a target before compiling it again to prevent old files not being deleted?
}

function build
{
    local buildTarget=$1

    case $buildTarget in
        all)
            targetLinuxAmd64
            ;;
        linuxAmd64)
            targetLinuxAmd64
            ;;
    esac

    echo "Build completed for target $buildTarget."
}

# Parameters (when no given, default to "all"):
target="${1-all}"

# Target processing:
case $target in
    clean)
        clean
        ;;
    all|linuxAmd64)
        build $target
        ;;
    -h|--help|help|*)
        echo "Platform targets:"
        echo "  limuxAmd64"
        echo "Special targets:"
        echo "  clean - Clean the build directory."
        echo "  all - Build all targets."
        ;;
esac
