#include "../common/convert.h"
#include "memory.h"
#include "runtime.h"
#include "syscodes.h"
#include "../common/types.h"

UInt8* currentMemoryAddress = null;

/**
 * Initialise the working memory.
 * @return The pointer to the start of the memory.
 */
UInt8* initialise ()
{
    const UInt memorySize = 30000;

    currentMemoryAddress = alloc(memorySize);

    for (UInt i = 0; i < memorySize; i++)
    {
        currentMemoryAddress[i] = 0;
    }

    return currentMemoryAddress;
}

/**
 * Read a character from the standard input.
 * @return The character that has been read in.
 */
UInt8 read ()
{
    Int fileDescriptor = 0; // File descriptor ID for stdin

    const UInt bufferSize = 8;
    UInt8 buffer[bufferSize]; // TODO: Could the buffer be a UInt8 instead of an array?

    Int bytesRead = 0;
    UInt8 result = 0;

    while (true)
    {
        asm volatile ("syscall" : "=a" (bytesRead)
                                : "d" (bufferSize), "S" (&buffer[0]), "D" (fileDescriptor), "a" (SyscodeRead)
                                : "rcx", "r11");

        // TODO: Check for errors (bytesRead is -1).

        if (bytesRead > 0)
        {
            if (result == 0)
            {
                result = buffer[0];
            }

            // We end reading as soon as the last character is a line break:
            if (buffer[bytesRead - 1] == '\n')
            {
                break;
            }
        }
        else
        {
            break;
        }
    }

    // TODO: It is a bit ugly that the user has to press enter and a line break is inserted into the terminal. Could this be prevented?

    return result;
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

/**
 * Debug print the memory as decimal numbers.
 * @param cellCount The number of cells to print.
 */
void debug (UInt64 cellCount)
{
    if (currentMemoryAddress == null)
    {
        write('0');
        return;
    }

    UInt8 textBuffer[3] = { 0, 0, 0 };

    write('\n');

    for (UInt64 i = 0; i < cellCount; i++)
    {
        convertByteToString(currentMemoryAddress[i], textBuffer);

        if (textBuffer[0] != '0')
        {
            write(textBuffer[0]);
            write(textBuffer[1]);
        }
        else if (textBuffer[1] != '0')
        {
            write(textBuffer[1]);
        }

        write(textBuffer[2]);

        if (i < cellCount - 1)
        {
            write('-');
        }
    }
}

/**
 * Exit the programme.
 * Will not return.
 */
void exit ()
{
    write('\n');

    UInt returnCode = 0;

    Int result;

    asm volatile ("syscall" : "=a" (result) : "D" (returnCode), "a" (SyscodeExit));
}
