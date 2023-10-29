import chalk from 'chalk';
import { LineInformation } from './lineInformation';
import { DiagnosticCode } from './diagnosticCodes';

/**
 * A diagnostic error is an error in the code that will lead to an invalid result, which means that compiling cannot completely finnish.
 */
export class DiagnosticError extends Error
{
    private readonly text: string;
    private readonly lineInformation?: LineInformation;

    public readonly code: string;

    public get prettyMessage (): string
    {
        let result = '';

        if (this.lineInformation)
        {
            result +=
                chalk.blueBright(this.lineInformation.fileName) + ':' +
                chalk.yellowBright(this.lineInformation.lineNumber) + ':' +
                chalk.yellowBright(this.lineInformation.columnNumber) + ' - ';
        }

        result +=
            chalk.redBright('Error') + ' ' +
            chalk.magenta(this.code) + ': ' +
            this.text;

        return result;
    }

    /**
     * @param code The diagnostic code of the message. Must not be coloured.
     * @param text The text of the message. Should not be coloured.
     * @param lineInformation The line information with the location the message applies to.
     */
    constructor (code: DiagnosticCode, text: string, lineInformation?: LineInformation)
    {
        super(code);

        this.code = code;
        this.text = text;
        this.lineInformation = lineInformation;

        this.name = 'DiagnosticError';
    }
}
