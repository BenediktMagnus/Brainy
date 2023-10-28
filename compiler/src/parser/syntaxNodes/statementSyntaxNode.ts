import { SyntaxKind } from '../syntaxKind';
import { Token } from '../../lexer/token';

export type StatementSyntaxKind = SyntaxKind.PointerIncrement|SyntaxKind.PointerDecrement|SyntaxKind.ValueIncrement|
                                  SyntaxKind.ValueDecrement|SyntaxKind.Output|SyntaxKind.Input;

export class StatementSyntaxNode
{
    public readonly token: Token;
    public readonly kind: StatementSyntaxKind;

    constructor (token: Token, kind: StatementSyntaxKind)
    {
        this.token = token;
        this.kind = kind;
    }
}
