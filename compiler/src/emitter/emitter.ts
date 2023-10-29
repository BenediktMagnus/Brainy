import * as Instructions from './instructions';
import * as SyntaxNodes from '../parser/syntaxNodes';
import { ArrayBuilder } from '../utility/arrayBuilder';
import { SyntaxKind } from '../parser/syntaxKind';
import { LlvmType } from './llvmType';

export class Emitter
{
    private readonly nativeIntegerType = LlvmType.Integer64;
    private readonly memoryName = "%memory";
    private readonly indexName = "%index";

    private instructions: ArrayBuilder<Instructions.Instruction>;

    /** Counter for temporary variables. */
    private variableCounter: number; // TODO: Should "variable" renamed into "register"?
    private get nextVariableName (): string
    {
        this.variableCounter++;
        return `%"${this.variableCounter}v"`;
    }

    /** Label counter for the generation of basic blocks as required by LLVM. */
    private labelCounter: number;
    public get nextLabelName (): string // TODO: Make private.
    {
        this.labelCounter++;
        return `"${this.labelCounter}l"`;
    }

    constructor ()
    {
        this.instructions = new ArrayBuilder();

        this.variableCounter = -1;
        this.labelCounter = -1;
    }

    public run (fileSyntaxNode: SyntaxNodes.File): string
    {
        this.instructions.clear();
        this.variableCounter = -1;
        this.labelCounter = -1;

        this.instructions.push(
            // External runtime functions:
            new Instructions.Instruction('declare', LlvmType.Pointer, '@initialise', '()'),
            new Instructions.Instruction('declare', LlvmType.Integer8, '@read', '()'),
            new Instructions.Instruction('declare', LlvmType.Void, '@write', `(${LlvmType.Integer8})`),
            new Instructions.Instruction('declare', LlvmType.Void, '@exit', '()', 'noreturn'),

            // Entry point:
            new Instructions.Function(LlvmType.Void, '@_start', []),
            new Instructions.Instruction('{'),
            new Instructions.Label('entry'),

            // Declare the index to the memory:
            new Instructions.Assignment(
                this.indexName,
                'alloca',
                this.nativeIntegerType,
            ),
            // Call to initialise the memory:
            new Instructions.Assignment(
                this.memoryName,
                'call',
                LlvmType.Pointer,
                '@initialise',
                '()'
            ),
        );

        this.transpileFile(fileSyntaxNode);

        this.instructions.push(
            new Instructions.Instruction('call', LlvmType.Void, '@exit', '()'),
            new Instructions.Instruction('ret', LlvmType.Void),
            new Instructions.Instruction('}'),
        );

        const fileText = this.convertInstructionsToText(this.instructions.toArray());

        return fileText;
    }

    private convertInstructionsToText (instructions: Instructions.Instruction[]): string
    {
        let text = '';
        let indentation = '';

        for (const instruction of instructions)
        {
            if (instruction.command == '}')
            {
                indentation = indentation.slice(4);
            }

            text += instruction.render() + '\n';

            if (instruction.command == '{')
            {
                indentation += '    ';
            }
        }

        return text;
    }

    /**
     * Load a variable into a temporary.
     * @param from The variable to load from.
     * @param size The size of the variable.
     * @returns The name of the temporary.
     */
    private loadFromVariable (variable: string, size: string): string
    {
        const temporary = this.nextVariableName;

        this.instructions.push(
            new LlvmInstructions.Assignment(
                temporary,
                'load',
                size + ',',
                this.pointerSize,
                variable,
            ),
        );

        return temporary;
    }

    /**
     * Stores a temporary into a variable.
     * @param from The temporary to store from.
     * @param to The variable to store into.
     * @param size The size of the variable.
     */
    private storeIntoVariable (temporary: string, variable: string, size: string): void
    {
        this.instructions.push(
            new Instructions.Instruction(
                'store',
                size,
                temporary + ',',
                this.pointerSize,
                variable,
            )
        );
    }

    private castToIntegerPointer (from: string): string
    {
        const bitcastTemporary = this.nextVariableName;

        this.instructions.push(
            new LlvmInstructions.Assignment(
                bitcastTemporary,
                'bitcast',
                this.pointerSize,
                from,
                'to',
                this.integerPointerSize,
            ),
        );

        return bitcastTemporary;
    }

    public castToPointer (from: string): string
    {
        const bitcastTemporary = this.nextVariableName;

        this.instructions.push(
            new LlvmInstructions.Assignment(
                bitcastTemporary,
                'bitcast',
                this.integerPointerSize,
                from,
                'to',
                this.pointerSize,
            ),
        );

        return bitcastTemporary;
    }

    private transpileFile (fileSyntaxNode: SyntaxNodes.File): void
    {
        for (const command of fileSyntaxNode.commands)
        {
            this.transpileCommand(command);
        }
    }

    private transpileCommand (commandSyntaxNode: SyntaxNodes.Command): void
    {
        if (commandSyntaxNode.kind == SyntaxKind.Loop)
        {
            this.transpileLoop(commandSyntaxNode);
        }
        else
        {
            this.transpileStatement(commandSyntaxNode);
        }
    }

    private transpileLoop (_loopSyntaxNode: SyntaxNodes.Loop): void
    {

    }

    private transpileStatement (statementSyntaxNode: SyntaxNodes.Statement): void
    {
        switch (statementSyntaxNode.kind)
        {
            case SyntaxKind.PointerIncrement:
                this.transpilePointerIncrement();
                break;
            case SyntaxKind.PointerDecrement:
                this.transpilePointerDecrement();
                break;
            case SyntaxKind.ValueIncrement:
                this.transpileValueIncrement();
                break;
            case SyntaxKind.ValueDecrement:
                this.transpileValueDecrement();
                break;
            case SyntaxKind.Input:
                this.transpileInput();
                break;
            case SyntaxKind.Output:
                this.transpileOutput();
                break;
        }
    }

    private transpilePointerIncrement (): void
    {
        const castedPointer = this.castToIntegerPointer(this.memoryPointerName);
        const castedTemporary = this.loadFromVariable(castedPointer, this.integerSize);

        const resultTemporary = this.nextVariableName;

        this.instructions.push(
            new LlvmInstructions.Assignment(
                resultTemporary,
                'add',
                this.integerSize,
                castedTemporary + ',',
                '1'
            ),
        );

        //const resultAsPointerTemporary = this.castToPointer(resultTemporary);

        this.storeIntoVariable(resultTemporary, this.memoryPointerName, this.pointerSize);
    }

    private transpilePointerDecrement (): void
    {
        const pointerTemporary = this.loadFromVariable(this.memoryPointerName, this.pointerSize);

        const resultTemporary = this.nextVariableName;

        this.instructions.push(
            new LlvmInstructions.Assignment(
                resultTemporary,
                'sub',
                this.integerSize,
                pointerTemporary + ',',
                '1'
            ),
        );

        this.storeIntoVariable(resultTemporary, this.memoryPointerName, this.pointerSize);
    }

    private transpileValueIncrement (): void
    {
        const loadedIndex = this.nextVariableName;
        const memoryCellPointer = this.nextVariableName;
        const memoryCell = this.nextVariableName;
        const incrementResult = this.nextVariableName;

        this.instructions.push(
            new Instructions.Load(loadedIndex, this.indexName, this.nativeIntegerType),
            new Instructions.GetElementPointer(memoryCellPointer, LlvmType.Integer8, loadedIndex, this.memoryName),
            new Instructions.Load(memoryCell, memoryCellPointer, LlvmType.Integer8),
            new Instructions.Assignment(incrementResult, 'add', LlvmType.Integer8, memoryCell + ',', '1'),
            new Instructions.Store(memoryCellPointer, incrementResult, LlvmType.Integer8),
        );
    }

    private transpileValueDecrement (): void
    {
        const pointerTemporary = this.loadFromVariable(this.memoryPointerName, this.pointerSize);
        const valueTemporary = this.loadFromVariable(pointerTemporary, this.integerSize);

        const resultTemporary = this.nextVariableName;

        this.instructions.push(
            new LlvmInstructions.Assignment(
                resultTemporary,
                'sub',
                this.integerSize,
                valueTemporary + ',',
                '1'
            ),
        );

        this.storeIntoVariable(resultTemporary, pointerTemporary, this.integerSize);
    }

    private transpileInput (): void
    {
        // TODO: Implement.
        return;
    }

    private transpileOutput (): void
    {
        const loadedIndex = this.nextVariableName;
        const memoryCellPointer = this.nextVariableName;
        const memoryCell = this.nextVariableName;

        this.instructions.push(
            new Instructions.Load(loadedIndex, this.indexName, this.nativeIntegerType),
            new Instructions.GetElementPointer(memoryCellPointer, LlvmType.Integer8, loadedIndex, this.memoryName),
            new Instructions.Load(memoryCell, memoryCellPointer, LlvmType.Integer8),
            new Instructions.Instruction('call', LlvmType.Void, '@write', `(${LlvmType.Integer8} ${memoryCell})`)
        );
    }
}
