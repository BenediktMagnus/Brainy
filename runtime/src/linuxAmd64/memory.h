#pragma once

#include "../common/types.h"

UInt8* alloc (UInt size);
void free (const UInt8* address, UInt size);
void copy (UInt8* destination, const UInt8* source, UInt size);
