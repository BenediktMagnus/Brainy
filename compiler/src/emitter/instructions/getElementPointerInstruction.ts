import * as Instructions from '.';
import { LlvmType } from '../llvmType';

/**
 * A LLVM getelementptr instruction in the form of: toVariable = getelementptr type, ptr fromVariable, i64 index
 */
export class GetElementPointerInstruction extends Instructions.Instruction
{
    constructor (fromVariable: string, toVariable: string, type: LlvmType, index: string) // TODO: Switch to and from variables
    {
        const command = toVariable + ' = getelementptr';

        super(command, type + ',', 'ptr', fromVariable + ',', 'i64', index);
    }
}
