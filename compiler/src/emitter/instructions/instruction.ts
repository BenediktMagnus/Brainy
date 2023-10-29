export class Instruction
{
    public command: string;
    private operands: string[];

    protected commandOperandSplitter: string;
    protected operandSplitter: string;
    protected prefix: string;
    protected postfix: string;

    constructor (command: string, ...operands: string[])
    {
        this.command = command;
        this.operands = operands;

        this.commandOperandSplitter = ' ';
        this.operandSplitter = ' ';
        this.prefix = '';
        this.postfix = '';
    }

    /**
     * Render the instruction as a string.
     */
    public render (): string
    {
        let operandsString = '';
        if (this.operands.length > 0)
        {
            operandsString = this.commandOperandSplitter + this.operands.join(this.operandSplitter);
        }

        return this.prefix + this.command + operandsString + this.postfix;
    }
}
