import * as Instructions from '.';

/**
 * A LLVM assignment instruction in the form of: variable = operands...
 */
export class AssignmentInstruction extends Instructions.Instruction
{
    constructor (variableName: string, ...operands: string[])
    {
        const command = variableName + ' =';

        super(command, ...operands);
    }
}
