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

    /** Label counter for the generation of loops. */
    private labelCounter: number;
    private get nextLabelName (): string
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

            text += instruction.render(indentation) + '\n';

            if (instruction.command == '{')
            {
                indentation += '    ';
            }
        }

        return text;
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

    private transpileLoop (loopSyntaxNode: SyntaxNodes.Loop): void
    {
        const beginLabel = this.nextLabelName;
        const endLabel = this.nextLabelName;

        this.jumpIfCellIsZero(endLabel, beginLabel);

        this.instructions.push(
            new Instructions.Label(beginLabel),
        );

        for (const command of loopSyntaxNode.commands)
        {
            this.transpileCommand(command);
        }

        this.jumpIfCellIsZero(endLabel, beginLabel);

        this.instructions.push(
            new Instructions.Label(endLabel),
        );
    }

    private jumpIfCellIsZero (trueLabel: string, falseLabel: string)
    {
        const loadedIndex = this.nextVariableName;
        const memoryCellPointer = this.nextVariableName;
        const memoryCell = this.nextVariableName;
        const comparisonVariableName = this.nextVariableName;

        this.instructions.push(
            new Instructions.Load(loadedIndex, this.indexName, this.nativeIntegerType),
            new Instructions.GetElementPointer(memoryCellPointer, LlvmType.Integer8, loadedIndex, this.memoryName),
            new Instructions.Load(memoryCell, memoryCellPointer, LlvmType.Integer8),
        );

        this.instructions.push(
            new Instructions.Assignment(
                comparisonVariableName,
                'icmp',
                'eq',
                LlvmType.Integer8,
                memoryCell + ',',
                '0',
            ),
            new Instructions.Branch(
                comparisonVariableName,
                trueLabel,
                falseLabel
            ),
        );
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
        const loadedIndex = this.nextVariableName;
        const incrementResult = this.nextVariableName;

        this.instructions.push(
            new Instructions.Load(loadedIndex, this.indexName, this.nativeIntegerType),
            new Instructions.Assignment(incrementResult, 'add', this.nativeIntegerType, loadedIndex + ',', '1'),
            new Instructions.Store(this.indexName, incrementResult, this.nativeIntegerType),
        );
    }

    private transpilePointerDecrement (): void
    {
        const loadedIndex = this.nextVariableName;
        const incrementResult = this.nextVariableName;

        this.instructions.push(
            new Instructions.Load(loadedIndex, this.indexName, this.nativeIntegerType),
            new Instructions.Assignment(incrementResult, 'sub', this.nativeIntegerType, loadedIndex + ',', '1'),
            new Instructions.Store(this.indexName, incrementResult, this.nativeIntegerType),
        );
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
        const loadedIndex = this.nextVariableName;
        const memoryCellPointer = this.nextVariableName;
        const memoryCell = this.nextVariableName;
        const incrementResult = this.nextVariableName;

        this.instructions.push(
            new Instructions.Load(loadedIndex, this.indexName, this.nativeIntegerType),
            new Instructions.GetElementPointer(memoryCellPointer, LlvmType.Integer8, loadedIndex, this.memoryName),
            new Instructions.Load(memoryCell, memoryCellPointer, LlvmType.Integer8),
            new Instructions.Assignment(incrementResult, 'sub', LlvmType.Integer8, memoryCell + ',', '1'),
            new Instructions.Store(memoryCellPointer, incrementResult, LlvmType.Integer8),
        );
    }

    private transpileInput (): void
    {
        const readResult = this.nextVariableName;
        const loadedIndex = this.nextVariableName;
        const memoryCellPointer = this.nextVariableName;

        this.instructions.push(
            new Instructions.Load(loadedIndex, this.indexName, this.nativeIntegerType),
            new Instructions.GetElementPointer(memoryCellPointer, LlvmType.Integer8, loadedIndex, this.memoryName),
            new Instructions.Assignment(readResult, 'call', LlvmType.Integer8, '@read', `()`),
            new Instructions.Store(memoryCellPointer, readResult, LlvmType.Integer8),
        );
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
