import { SyntaxKind } from '../syntaxKind';
import { Token } from '../../lexer/token';
import { CommandSyntaxNode } from './syntaxNode';

export class LoopSyntaxNode
{
    public readonly kind: SyntaxKind.Loop;

    public readonly beginToken: Token;
    public readonly endToken: Token;

    public readonly statements: CommandSyntaxNode[];

    constructor (beginToken: Token, endToken: Token, statements: CommandSyntaxNode[])
    {
        this.beginToken = beginToken;
        this.endToken = endToken;
        this.statements = statements;

        this.kind = SyntaxKind.Loop;
    }
}
