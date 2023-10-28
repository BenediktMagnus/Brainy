#include "memory.h"
#include "syscodes.h"
#include "../common/types.h"

/**
 * Initialise the working memory.
 * @return The pointer to the start of the memory.
 */
void* initialise ()
{
    const UInt memorySize = 30000;

    UInt8* memoryAddress = alloc(memorySize);

    for (UInt i = 0; i < memorySize; i++)
    {
        memoryAddress[i] = 0;
    }

    return memoryAddress;
}

/**
 * Exit the programme.
 * Will not return.
 */
void exit ()
{
    UInt returnCode = 0;

    Int result;

    asm volatile ("syscall" : "=a" (result) : "D" (returnCode), "a" (SyscodeExit));
}

/**
 * Read a character from the standard input.
 * @return The character that has been read in.
 */
UInt8 read ()
{
    Int fileDescriptor = 0; // File descriptor ID for stdin

    const UInt bufferSize = 1;
    UInt8 buffer[bufferSize]; // TODO: Could the buffer be a UInt8 instead of an array?

    Int bytesRead = 0;

    while (true)
    {
        asm volatile ("syscall" : "=a" (bytesRead)
                                : "d" (bufferSize), "S" (&buffer[0]), "D" (fileDescriptor), "a" (SyscodeRead)
                                : "rcx", "r11");

        // TODO: Check for errors (bytesRead is -1).

        if (bytesRead > 0)
        {
            return buffer[0];
        }
        else
        {
            continue;
        }
    }
}

/**
 * Write a character to the standard output.
 */
void write (UInt8 character)
{
    const UInt size = 1;

    volatile UInt8 text[] = { character };

    const Int fileDescriptor = 1; // File descriptor ID for stdout

    Int result;

    asm volatile ("syscall" : "=a" (result)
                            : "d" (size), "S" (text), "D" (fileDescriptor), "a" (SyscodeWrite)
                            : "rcx", "r11");

    // TODO: Check if result is an error (-1) or less than the text size.
}
