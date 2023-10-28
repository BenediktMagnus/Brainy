import { FileSyntaxNode } from './fileSyntaxNode';
import { LoopSyntaxNode } from './loopSyntaxNode';
import { StatementSyntaxNode } from './statementSyntaxNode';

export type CommandSyntaxNode = StatementSyntaxNode|LoopSyntaxNode;
export type SyntaxNode = FileSyntaxNode|CommandSyntaxNode;
