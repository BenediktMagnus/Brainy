import { Command, CommanderError, Option } from 'commander';
import { TargetPlatform } from './targetPlatform';

export type ProcessArgumentsError = CommanderError;

/** This is the typing for the result of command.opts. It allows typesafe handling of the options. */
interface OptionValues
{
    target?: TargetPlatform;
    runtimeLibary?: string;
}

export class ProcessArguments
{
    public readonly filePath: string;
    public readonly outputPath: string;
    public readonly targetPlatform: TargetPlatform;
    public readonly runtimeLibaryPath: string|null;

    constructor (argv?: string[])
    {
        let filePath = '';
        let outputPath = '';

        let command = new Command();

        command.exitOverride(
            (error): void =>
            {
                // We do not want that command calls process.exit() directly. Instead, the error shall be thrown so that we can handle
                // it later, either in the programme itself (and do not much with it) or, more importantly, in the unit tests to test
                // whether there really has been an error.
                throw error;
            }
        );

        command.name('brainy');

        command
            .arguments('<inputFile> <outputFile>')
            .action(
                (inputFile: string, outputFile: string) =>
                {
                    filePath = inputFile;
                    outputPath = outputFile;
                }
            );

        command
            .option(
                '-l, --runtimeLibrary <file>',
                'File path to the compiled runtime library',
            );

        const targetOption = new Option('-t, --target <platform>', 'Set the compilation target platform');
        targetOption.choices(Object.values(TargetPlatform));
        command.addOption(targetOption);

        command = command.parse(argv, { from: argv === undefined ? 'node' : 'user' });

        // TODO: Check how the typing changed here (in the whole commander library):
        const options = command.opts<OptionValues>();

        // If the following were still empty, the command parsing would have thrown an error.
        this.filePath = filePath;
        this.outputPath = outputPath;

        this.runtimeLibaryPath = options.runtimeLibary ?? null;

        this.targetPlatform = options.target ?? TargetPlatform.LinuxAmd64;
        // TODO: Use the platform the compiler runs on as default (process.arch, process.platform).
    }
}
