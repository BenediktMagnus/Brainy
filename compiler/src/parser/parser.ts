import * as Diagnostic from '../diagnostic';
import * as SyntaxNodes from './syntaxNodes';
import { Token } from '../lexer/token';
import { TokenKind } from '../lexer/tokenKind';
import { SyntaxKind } from './syntaxKind';

export class Parser
{
    private readonly diagnostic: Diagnostic.Diagnostic;

    private fileName: string;
    private tokens: Token[];
    private position: number;

    constructor (diagnostic: Diagnostic.Diagnostic)
    {
        this.diagnostic = diagnostic;

        this.fileName = '';
        this.tokens = [];
        this.position = 0;
    }

    private getNextToken (): Token
    {
        let result: Token;

        if ((this.position < this.tokens.length) && (this.position >= 0))
        {
            result = this.tokens[this.position];
        }
        else
        {
            result = new Token(TokenKind.NoToken, '');
        }

        return result;
    }

    private consumeNextToken (): Token
    {
        const nextToken = this.getNextToken();

        this.position++;

        return nextToken;
    }

    /**
     * Run the parser for a given token list of a file.
     * @param tokens The list of tokens
     * @param fileName The name/path of the file
     * @return The root of the parsed syntax tree.
     */
    public run (tokens: Token[], fileName: string): SyntaxNodes.File
    {
        this.fileName = fileName;
        this.tokens = tokens;
        this.position = 0;

        const parsedFile = this.parseFile();

        return parsedFile;
    }

    private parseFile (): SyntaxNodes.File
    {
        const commands: SyntaxNodes.Command[] = [];

        while (this.getNextToken().kind != TokenKind.NoToken)
        {
            const command = this.parseCommand();
            commands.push(command);
        }

        const fileRoot = new SyntaxNodes.File(this.fileName, commands);

        return fileRoot;
    }

    private parseCommand (): SyntaxNodes.Command
    {
        const nextToken = this.getNextToken();

        switch (nextToken.kind)
        {
            case TokenKind.LoopStart:
                return this.parseLoop();
            case TokenKind.LoopEnd:
                this.diagnostic.throw(
                    new Diagnostic.Error(
                        `Found loop end token before loop start token.`,
                        Diagnostic.Codes.LoopEndTokenBeforeLoopStartToken,
                        nextToken
                    )
                );
            default:
                return this.parseStatement();
        }
    }

    private parseLoop (): SyntaxNodes.Loop
    {
        const beginToken = this.consumeNextToken();
        if (beginToken.kind != TokenKind.LoopStart)
        {
            this.diagnostic.throw(
                new Diagnostic.Error(
                    `Expected loop start token, but got "${beginToken}".`,
                    Diagnostic.Codes.ExpectedLoopStartToken,
                    beginToken
                )
            );
        }

        const statements: SyntaxNodes.Statement[] = [];

        while (true)
        {
            const nextToken = this.getNextToken();

            if (nextToken.kind == TokenKind.LoopEnd)
            {
                break;
            }
            else if (nextToken.kind == TokenKind.NoToken)
            {
                this.diagnostic.throw(
                    new Diagnostic.Error(
                        `Unexpected end of file in loop.`,
                        Diagnostic.Codes.UnexpectedEndOfFileInLoop,
                        nextToken
                    )
                );
            }
            else
            {
                const statement = this.parseStatement();
                statements.push(statement);
            }
        }

        const endToken = this.consumeNextToken();
        if (endToken.kind != TokenKind.LoopEnd)
        {
            this.diagnostic.throw(
                new Diagnostic.Error(
                    `Expected loop end token, but got "${endToken}".`,
                    Diagnostic.Codes.ExpectedLoopEndToken,
                    endToken
                )
            );
        }

        return new SyntaxNodes.Loop(beginToken, endToken, statements);
    }

    private parseStatement (): SyntaxNodes.Statement
    {
        const token = this.consumeNextToken();
        let kind: SyntaxKind;

        switch (token.kind)
        {
            case TokenKind.PointerIncrement:
                kind = SyntaxKind.PointerIncrement;
                break;
            case TokenKind.PointerDecrement:
                kind = SyntaxKind.PointerDecrement;
                break;
            case TokenKind.ValueIncrement:
                kind = SyntaxKind.ValueIncrement;
                break;
            case TokenKind.ValueDecrement:
                kind = SyntaxKind.ValueDecrement;
                break;
            case TokenKind.Input:
                kind = SyntaxKind.Input;
                break;
            case TokenKind.Output:
                kind = SyntaxKind.Output;
                break;
            default:
                this.diagnostic.throw(
                    new Diagnostic.Error(
                        `Unexpected token "${token}" in statement.`,
                        Diagnostic.Codes.UnexpectedTokenInStatement,
                        token
                    )
                );
        }

        return new SyntaxNodes.Statement(token, kind);
    }
}
