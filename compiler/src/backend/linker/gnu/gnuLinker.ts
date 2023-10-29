import childProcess from 'child_process';

export class GnuLinker
{
    public run (outputPath: string, filePaths: string[]): void
    {
        const filesAsString = filePaths.join('" "'); // TODO: Give a better name.

        childProcess.execSync(
            'ld ' +
            '-e _start ' +
            '-s --gc-sections -n ' +
            '-nostdlib ' +
            '-o "' + outputPath + '" ' +
            '"' + filesAsString + '"'
        );
    }
}
