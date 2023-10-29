import * as Instructions from '.';
import { LlvmType } from '../llvmType';

/**
 * A LLVM load instruction in the form of: toVariable = load type, ptr fromVariable
 */
export class LoadInstruction extends Instructions.Instruction
{
    constructor (fromVariable: string, toVariable: string, type: LlvmType) // TODO: Switch to and from variables
    {
        const command = toVariable + ' = load';

        super(command, type + ',', 'ptr', fromVariable);
    }
}
