#include "syscodes.h"
#include "../common/types.h"

/**
 * Allocate memory on the heap.
 * @param size The size of the memory block to allocate.
 * @return The pointer to the allocated memory.
 */
UInt8* alloc (UInt size)
{
    UInt8* address = 0;
    UInt prot = 0x3; // 0x3 = PROT_READ|PROT_WRITE
    register UInt flags asm("r10") = 0x22; // 0x22 = MAP_PRIVATE|MAP_ANONYMOUS
    register Int fileDescriptor asm("r8") = -1;
    register UInt offset asm("r9") = 0;
    UInt8* result;

    asm volatile ("syscall" : "=a" (result)
                            : "S" (size), "D" (address), "d" (prot), "r" (flags), "r" (fileDescriptor), "r" (offset), "a" (SyscodeMemoryMap)
                            : "rcx", "r11");

    return result;
}

/**
 * Free allocated heap memory.
 * @param address The pointer to the memory to free.
 * @param size The size of the memory block.
 */
void free (const UInt8* address, UInt size)
{
    Int result;

    asm volatile ("syscall" : "=a" (result)
                            : "D" (address), "S" (size), "a" (SyscodeMemoryUnmap)
                            : "rcx", "r11");

    // TODO: Check result (0 on success, -1 on failure).

    return;
}

/**
 * Direct memory to memory copy.
 * @param destination The location to copy the block to.
 * @param source The location to copy the block from.
 * @param size The size of the memory block to copy.
 */
void copy (UInt8* destination, const UInt8* source, UInt size)
{
    for (UInt i = 0; i < size; i++)
    {
        destination[i] = source[i];
    }

    return;
}
