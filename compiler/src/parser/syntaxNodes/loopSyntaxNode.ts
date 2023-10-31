import { CommandSyntaxNode } from './syntaxNode';
import { SyntaxKind } from '../syntaxKind';
import { Token } from '../../lexer/token';

export class LoopSyntaxNode
{
    public readonly kind: SyntaxKind.Loop;

    public readonly beginToken: Token;
    public readonly endToken: Token;

    public readonly commands: CommandSyntaxNode[];

    constructor (beginToken: Token, endToken: Token, commands: CommandSyntaxNode[])
    {
        this.beginToken = beginToken;
        this.endToken = endToken;
        this.commands = commands;

        this.kind = SyntaxKind.Loop;
    }
}
