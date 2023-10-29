import { Backend } from './backend';
import FileSystem from 'fs';
import { GnuLinker } from './linker/gnu/gnuLinker';
import { LinuxAmd64GnuAssembler } from './assembler/linuxAmd64Gnu/linuxAmd64GnuAssembler';
import { LlvmCompiler } from './llvm/llvmCompiler';
import { LlvmCompilerTarget } from './llvm/llvmCompilerTarget';
import Path from 'path';

export class LinuxAmd64Backend implements Backend
{
    public compile (llvmIr: string, fileName: string, temporaryDirectoryPath: string): string
    {
        const compiler = new LlvmCompiler();
        const assembler = new LinuxAmd64GnuAssembler();

        // TODO: Better temporary file naming for the two temporary files.

        const temporaryLlvmIrFilePath = Path.join(temporaryDirectoryPath, fileName + '.ll');
        FileSystem.writeFileSync(temporaryLlvmIrFilePath, llvmIr, {encoding: 'utf8'});

        const temporaryAssemblyFilePath = Path.join(temporaryDirectoryPath, fileName + '.s');
        compiler.run(temporaryLlvmIrFilePath, temporaryAssemblyFilePath, LlvmCompilerTarget.LinuxAmd64);

        const temporaryObjectFilePath = Path.join(temporaryDirectoryPath, fileName + '.o');
        assembler.run(temporaryAssemblyFilePath, temporaryObjectFilePath);

        return temporaryObjectFilePath;
    }

    public link (inputFilePath: string, runtimeLibraryPath: string, outputFilePath: string): void
    {
        const linker = new GnuLinker(); // TODO: Should we switch to the LLVM linker (llvm-ld alias lld)?

        linker.run(outputFilePath, [inputFilePath, runtimeLibraryPath]);
    }
}
