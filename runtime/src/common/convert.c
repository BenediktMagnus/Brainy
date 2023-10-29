#include "types.h"

void convertByteToString (UInt8 character, UInt8 stringBuffer[3])
{
    stringBuffer[0] = '0';
    stringBuffer[1] = '0';
    stringBuffer[2] = '0';

    while (character >= 100)
    {
        character -= 100;
        stringBuffer[0]++;
    }

    while (character >= 10)
    {
        character -= 10;
        stringBuffer[1]++;
    }

    stringBuffer[2] += character;
}
