#!/usr/bin/env node

import * as Diagnostic from './diagnostic';
import { ProcessArguments, ProcessArgumentsError } from './commandLine/processArguments';
import FileSystem from 'fs';
import { Lexer } from './lexer/lexer';
import os from 'os';
import { Parser } from './parser/parser';
import { Emitter } from './emitter/emitter';

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
        const temporaryDirectoryPath = 'tmp';
        if (!FileSystem.existsSync(temporaryDirectoryPath))
        {
            FileSystem.mkdirSync(temporaryDirectoryPath);
        }

        const diagnostic = new Diagnostic.Diagnostic();

        const lexer = new Lexer();
        const parser = new Parser(diagnostic);
        const emitter = new Emitter();

        try
        {
            const fileContent = FileSystem.readFileSync(this.arguments.filePath, {encoding: 'utf8'});

            const tokens = lexer.run(fileContent, this.arguments.filePath);
            const syntaxTree = parser.run(tokens, this.arguments.filePath);
            const llvmCode = emitter.run(syntaxTree);

            diagnostic.end();
        }
        catch (error)
        {
            if (error instanceof Diagnostic.Exception)
            {
                return;
            }
            else
            {
                throw error;
            }
        }
        finally
        {
            if (diagnostic.errors.length != 0)
            {
                const errorString = diagnostic.errors.join(os.EOL);

                console.error(errorString);
            }

            if (diagnostic.warnings.length != 0)
            {
                const warningString = diagnostic.warnings.join(os.EOL);

                console.error(warningString);
            }

            if (diagnostic.info.length != 0)
            {
                const infoString = diagnostic.info.join(os.EOL);

                console.error(infoString);
            }
        }
    }
}

const main = new Main();
main.run();
