import { Token } from './token';
import { TokenKind } from './tokenKind';

export class Lexer
{
    private fileName: string;
    private text: string;
    private position: number;
    private line: number;
    private column: number;

    constructor ()
    {
        this.fileName = '';
        this.text = '';
        this.position = 0;
        this.line = 1;
        this.column = 1;
    }

    private consumeNextCharacter (): string
    {
        let result = '';

        if (this.position < this.text.length)
        {
            result = this.text[this.position];
        }

        this.position++;

        return result;
    }

    /**
     * Run the lexer.
     * @param fileContent The content of the file
     * @param fileName The name/path of the file
     * @returns The generated list of tokens.
     */
    public run (fileContent: string, fileName: string): Token[]
    {
        this.fileName = fileName;
        this.position = 0;
        this.line = 1;
        this.column = 1;
        this.text = fileContent;

        const tokens: Token[] = [];
        while (this.position < this.text.length)
        {
            const token = this.lex();

            if (token !== null)
            {
                tokens.push(token);
            }
        }

        const enfOfFileToken = new Token(TokenKind.NoToken, '', this.fileName, this.line, this.column);
        tokens.push(enfOfFileToken);

        return tokens;
    }

    public lex (): Token|null
    {
        let kind: TokenKind|undefined = undefined;
        const content = this.consumeNextCharacter();

        switch (content)
        {
            case "\r":
                if (this.consumeNextCharacter() !== "\n")
                {
                    this.position--;
                }
                // Fallthrough, because "\r" (Mac) and "\r\n" (Windows) must be treated as "\n" (Linux, Unix).
            case "\n":
                this.line++;
                this.column = 1;
                return null;
            case '>':
                kind = TokenKind.PointerIncrement;
                break;
            case '<':
                kind = TokenKind.PointerDecrement;
                break;
            case '+':
                kind = TokenKind.ValueIncrement;
                break;
            case '-':
                kind = TokenKind.ValueDecrement;
                break;
            case '.':
                kind = TokenKind.Output;
                break;
            case ',':
                kind = TokenKind.Input;
                break;
            case '[':
                kind = TokenKind.LoopStart;
                break;
            case ']':
                kind = TokenKind.LoopEnd;
                break;
            default:
            {
                return null;
            }
            // TODO: It would be cool to have a special token for debug prints.
        }

        const token = new Token(kind, content, this.fileName, this.line, this.column);

        this.column++;

        return token;
    }
}
