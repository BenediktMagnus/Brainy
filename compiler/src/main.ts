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

            const fileName = Path.parse(
                Path.basename(this.arguments.filePath)
            ).name;

            const objectFilePath = backend.compile(llvmCode, fileName, temporaryDirectoryPath);
            backend.link(objectFilePath, 'runtime/bin/linuxAmd64/runtime.a', this.arguments.outputPath); // TODO Replace hardcoded path.
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
}

const main = new Main();
main.run();
