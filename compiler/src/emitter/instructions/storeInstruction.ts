import * as Instructions from '.';
import { LlvmType } from '../llvmType';

/**
 * A LLVM store instruction in the form of: store type toVariable, ptr fromVariable
 */
export class StoreInstruction extends Instructions.Instruction
{
    constructor (fromVariable: string, toVariable: string, type: LlvmType)
    {
        super('store', type, toVariable + ',', 'ptr', fromVariable);
    }
}
