#pragma once

#include "../common/convert.h"
#include "memory.h"
#include "syscodes.h"
#include "../common/types.h"

UInt8* initialise ();
UInt8 read ();
void write (UInt8 character);
void debug (UInt64 cellCount);
void exit ();
