#!/usr/bin/env node

import { Backend } from './backend/backend';
import { DiagnosticError } from './diagnostic/diagnosticError';
import { Emitter } from './emitter/emitter';
import FileSystem from 'fs';
import { Lexer } from './lexer/lexer';
import { LinuxAmd64Backend } from './backend/linuxAmd64Backend';
import { Parser } from './parser/parser';
import Path from 'path';
import { ProcessArguments, ProcessArgumentsError } from './commandLine/processArguments';
import { TargetPlatform } from './commandLine/targetPlatform';

class Main
{
    private arguments: ProcessArguments;

    constructor ()
    {
        try
        {
            this.arguments = new ProcessArguments();
        }
        catch (error)
        {
            const processArgumentsError = error as ProcessArgumentsError;

            process.exit(processArgumentsError.exitCode);
        }
    }

    public run (): void
    {
        // Create temporary directory for intermediate (IL, ASM, binary etc.) files:
        // TODO: The temporary directory should be formalised or, if possible, completely removed.
        const temporaryDirectoryPath = 'obj';
        if (!FileSystem.existsSync(temporaryDirectoryPath))
        {
            FileSystem.mkdirSync(temporaryDirectoryPath);
        }

        const lexer = new Lexer();
        const parser = new Parser();
        const emitter = new Emitter();

        let backend: Backend;
        switch (this.arguments.targetPlatform)
        {
            case TargetPlatform.LinuxAmd64:
                backend = new LinuxAmd64Backend();
                break;
        }

        try
        {
            const fileContent = FileSystem.readFileSync(this.arguments.filePath, {encoding: 'utf8'});

            const tokens = lexer.run(fileContent, this.arguments.filePath);
            const syntaxTree = parser.run(tokens, this.arguments.filePath);
            const llvmCode = emitter.run(syntaxTree);

            const fileName = Path.parse(this.arguments.filePath).name;

            const objectFilePath = backend.compile(llvmCode, fileName, temporaryDirectoryPath);
            const runtimeLibraryPath = this.getRuntimeLibraryPath();

            backend.link(objectFilePath, runtimeLibraryPath, this.arguments.outputPath);
        }
        catch (error)
        {
            if (error instanceof DiagnosticError)
            {
                console.error(error.prettyMessage);
            }
            else
            {
                throw error;
            }
        }
    }

    private getRuntimeLibraryPath (): string
    {
        if (this.arguments.runtimeLibaryPath !== null)
        {
            return this.arguments.runtimeLibaryPath;
        }

        const compilerBinPath = Path.dirname(process.argv[1]);
        const compilerBasePath = Path.dirname(compilerBinPath);

        const possiblePaths = [
            // Shipped project:
            `${compilerBasePath}/runtime/${this.arguments.targetPlatform}/runtime.a`,
            // Relative to the caller:
            `runtime/${this.arguments.targetPlatform}/runtime.a`,
            `runtime/bin/${this.arguments.targetPlatform}/runtime.a`,
        ];

        for (const path of possiblePaths)
        {
            if (FileSystem.existsSync(path))
            {
                return path;
            }
        }

        return 'runtime.a';
    }
}

const main = new Main();
main.run();
