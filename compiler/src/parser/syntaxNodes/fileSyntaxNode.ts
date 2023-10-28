import { SyntaxKind } from '../syntaxKind';
import { CommandSyntaxNode } from './syntaxNode';

export class FileSyntaxNode
{
    public readonly kind: SyntaxKind.File;

    public readonly fileName: string;
    public readonly commands: CommandSyntaxNode[];

    constructor (fileName: string, commands: CommandSyntaxNode[])
    {
        this.fileName = fileName;
        this.commands = commands;

        this.kind = SyntaxKind.File;
    }
}
