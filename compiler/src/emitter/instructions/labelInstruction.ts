import { Instruction } from './instruction';

export class LabelInstruction extends Instruction
{
    constructor (text: string)
    {
        super(text);

        this.commandOperandSplitter = '';
        this.operandSplitter = '';
        this.prefix = '';
        this.postfix = ':';
    }
}
