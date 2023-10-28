#pragma once

/** 1 Byte signed integer */
typedef signed char Int8;
/** 2 Byte signed integer */
typedef signed short Int16;
/** 4 Byte signed integer */
typedef signed long Int32;
/** 8 Byte signed integer */
typedef signed long long Int64;

/** 1 Byte unsigned integer */
typedef unsigned char UInt8;
/** 2 Byte unsigned integer */
typedef unsigned short UInt16;
/** 4 Byte unsigned integer */
typedef unsigned long UInt32;
/** 8 Byte unsigned integer */
typedef unsigned long long UInt64;

/** 4 Byte floating point number */
typedef float Float32;
/** 8 Byte floating point number */
typedef double Float64;

/** 1 Byte Boolean */
typedef enum {
    false = (Int8)0,
    true = (Int8)-1,
} __attribute__((__packed__)) Bool;

#define null 0

#if defined(__x86_64__) || defined(__x86_64) || defined(__LP64__) || defined(_LP64)

    /** Architecture (word size) dependent signed integer */
    typedef Int64 Int;
    /** Architecture (word size) dependent unsigned integer */
    typedef UInt64 UInt;
    /** Architecture (word size) dependent floating point number */
    typedef Float64 Float;

#else

    #error "Architecture is not supported."

#endif
