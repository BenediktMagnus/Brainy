# The Brainy Compiler

A compiler for the Brainfuck programming language, written in Typecescript and utilising LLVM.

## How to Install

### Dependencies

- [Node.js](https://nodejs.org/) >= 18.18.0
- [LLVM](https://llvm.org/) = 14.0.0
- [GNU x86_64-linux-gnu-as](https://www.gnu.org/software/binutils/) >= 2.38
- [GNU ld](https://www.gnu.org/software/binutils/) >= 2.38

### Compiler

Simply download an extract the latest [release](https://github.com/BenediktMagnus/Brainy/releases).

## How to Compile

```
brainy helloWorld.bf helloWorld
```

For more info there is a help command:
```
brainy --help
```
