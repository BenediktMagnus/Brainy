import * as Instructions from '.';
import { LlvmType } from '../llvmType';

/**
 * A LLVM load instruction in the form of: toVariable = load type, ptr fromVariable
 */
export class LoadInstruction extends Instructions.Instruction
{
    constructor (fromVariable: string, toVariable: string, type: LlvmType)
    {
        const command = fromVariable + ' = load';

        super(command, type + ',', 'ptr', toVariable);
    }
}
