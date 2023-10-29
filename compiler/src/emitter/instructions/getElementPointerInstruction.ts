import * as Instructions from '.';
import { LlvmType } from '../llvmType';

/**
 * A LLVM getelementptr instruction in the form of: toVariable = getelementptr type, ptr fromVariable, i64 index
 */
export class GetElementPointerInstruction extends Instructions.Instruction
{
    constructor (fromVariable: string, type: LlvmType, index: string, toVariable: string)
    {
        const command = fromVariable + ' = getelementptr';

        super(command, type + ',', 'ptr', toVariable + ',', 'i64', index);
    }
}
