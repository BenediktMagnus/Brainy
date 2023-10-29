import * as Instructions from '.';
import { LlvmType } from '../llvmType';

/**
 * A LLVM function instruction in the form of: define returnType name (parameters...)
 */
export class FunctionInstruction extends Instructions.Instruction
{
    constructor (returnType: LlvmType, name: string, parameters: string[])
    {
        const parameterString = '(' + parameters.join(', ') + ')';

        super('define', returnType, name, parameterString);

        this.commandOperandSplitter = ' ';
        this.operandSplitter = ' ';
        this.prefix = '';
        this.postfix = '';
    }
}
