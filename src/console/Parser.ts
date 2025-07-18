/**
 * Command-Parser für die Web-Console
 * Konvertiert Token-Stream in AST
 */

import {
  CommandArgs,
  Environment,
  ParsedCommand,
  PipelineSegment,
  Redirection,
} from "../types/index.js";

import { RedirectionType } from "../enums/index.js";
import { Lexer, Token, TokenType } from "./Lexer.js";

/**
 * Parse error
 */
export class ParseError extends Error {
  constructor(
    message: string,
    public readonly token: Token,
    public readonly position: number,
  ) {
    super(
      `Parse error at line ${token.line}, column ${token.column}: ${message}`,
    );
    this.name = "ParseError";
  }
}

/**
 * Parser-Zustand
 */
interface ParserState {
  tokens: Token[];
  position: number;
  current: Token;
}

/**
 * Command-Parser Implementierung
 */
export class Parser {
  private state: ParserState;

  constructor(input: string) {
    const lexer = new Lexer(input);
    const tokens = lexer
      .tokenize()
      .filter((token) => token.type !== TokenType.WHITESPACE);

    this.state = {
      tokens,
      position: 0,
      current: tokens[0] || {
        type: TokenType.EOF,
        value: "",
        position: 0,
        line: 1,
        column: 1,
      },
    };
  }

  /**
   * Kommandozeile parsen
   */
  parse(): ParsedCommand {
    const environment: Environment = {};
    const segments: PipelineSegment[] = [];
    let background = false;

    // Process environment variables at the beginning
    while (this.current().type === TokenType.ASSIGNMENT) {
      const assignment = this.parseAssignment();
      environment[assignment.key] = assignment.value;
      this.advance();
    }

    // Pipeline parsen
    if (!this.isAtEnd() && this.current().type !== TokenType.EOF) {
      const pipeline = this.parsePipeline();
      segments.push(...pipeline);

      // Check background execution
      if (this.current().type === TokenType.BACKGROUND) {
        background = true;
        this.advance();
      }
    }

    this.expectEnd();

    return {
      segments,
      background,
      environment,
    };
  }

  /**
   * Pipeline parsen (Command | Command | ...)
   */
  private parsePipeline(): PipelineSegment[] {
    const segments: PipelineSegment[] = [];

    segments.push(this.parseCommand());

    while (this.current().type === TokenType.PIPE) {
      this.advance(); // Skip pipe
      segments.push(this.parseCommand());
    }

    return segments;
  }

  /**
   * Einzelnen Befehl parsen
   */
  private parseCommand(): PipelineSegment {
    let command = "";
    const args: CommandArgs = [];
    const redirections: Redirection[] = [];
    const environment: Environment = {};

    // Command-Name
    if (
      this.current().type === TokenType.WORD ||
      this.current().type === TokenType.STRING
    ) {
      command = this.current().value;
      this.advance();
    } else {
      throw new ParseError(
        "Expected command name",
        this.current(),
        this.state.position,
      );
    }

    // Argumente und Redirections
    while (!this.isCommandEnd()) {
      if (this.isRedirection()) {
        redirections.push(this.parseRedirection());
      } else if (this.current().type === TokenType.ASSIGNMENT) {
        // Environment variable assignment for this command
        const assignment = this.parseAssignment();
        environment[assignment.key] = assignment.value;
        this.advance();
      } else if (
        this.current().type === TokenType.WORD ||
        this.current().type === TokenType.STRING
      ) {
        args.push(this.current().value);
        this.advance();
      } else if (this.current().type === TokenType.VARIABLE) {
        // Variable expansion would happen here
        args.push(this.current().value);
        this.advance();
      } else {
        break;
      }
    }

    return {
      command,
      args,
      redirections,
      environment, // Add local environment variables
    };
  }

  /**
   * Redirection parsen
   */
  private parseRedirection(): Redirection {
    const token = this.current();
    this.advance();

    let type: RedirectionType;
    let source: number | undefined;

    switch (token.type) {
      case TokenType.REDIRECT_OUT:
        type = RedirectionType.OUTPUT;
        source = 1; // stdout
        break;
      case TokenType.REDIRECT_APPEND:
        type = RedirectionType.APPEND;
        source = 1; // stdout
        break;
      case TokenType.REDIRECT_IN:
        type = RedirectionType.INPUT;
        source = 0; // stdin
        break;
      case TokenType.REDIRECT_ERR:
        type = RedirectionType.ERROR;
        source = 2; // stderr
        break;
      case TokenType.REDIRECT_ERR_APPEND:
        type = RedirectionType.ERROR_APPEND;
        source = 2; // stderr
        break;
      default:
        throw new ParseError(
          `Invalid redirection token: ${token.value}`,
          token,
          this.state.position,
        );
    }

    // Target (Dateiname oder File-Descriptor)
    if (
      this.current().type !== TokenType.WORD &&
      this.current().type !== TokenType.STRING
    ) {
      throw new ParseError(
        "Expected redirection target",
        this.current(),
        this.state.position,
      );
    }

    const target = this.current().value;
    this.advance();

    // Check if target is a file descriptor (number)
    const targetFd = parseInt(target, 10);
    const resolvedTarget = !isNaN(targetFd) ? targetFd : target;

    return {
      type,
      target: resolvedTarget,
      source,
    };
  }

  /**
   * Assignment parsen (VAR=value)
   */
  private parseAssignment(): { key: string; value: string } {
    const assignment = this.current().value;
    const equalIndex = assignment.indexOf("=");

    if (equalIndex === -1) {
      throw new ParseError(
        "Invalid assignment syntax",
        this.current(),
        this.state.position,
      );
    }

    const key = assignment.substring(0, equalIndex);
    const value = assignment.substring(equalIndex + 1);

    return { key, value };
  }

  /**
   * Nächstes Token konsumieren
   */
  private advance(): void {
    if (this.state.position < this.state.tokens.length - 1) {
      this.state.position++;
      this.state.current = this.state.tokens[this.state.position] || {
        type: TokenType.EOF,
        value: "",
        position: 0,
        line: 1,
        column: 1,
      };
    }
  }

  /**
   * Aktuelles Token
   */
  private current(): Token {
    return this.state.current;
  }

  /**
   * Nächstes Token (ohne zu konsumieren)
   */
  private peek(): Token {
    if (this.state.position < this.state.tokens.length - 1) {
      return (
        this.state.tokens[this.state.position + 1] || {
          type: TokenType.EOF,
          value: "",
          position: 0,
          line: 1,
          column: 1,
        }
      );
    }
    return { type: TokenType.EOF, value: "", position: 0, line: 1, column: 1 };
  }

  /**
   * Prüft ob am Ende des Token-Streams
   */
  private isAtEnd(): boolean {
    return this.current().type === TokenType.EOF;
  }

  /**
   * Prüft ob aktuelles Token eine Redirection ist
   */
  private isRedirection(): boolean {
    const type = this.current().type;
    return (
      type === TokenType.REDIRECT_OUT ||
      type === TokenType.REDIRECT_APPEND ||
      type === TokenType.REDIRECT_IN ||
      type === TokenType.REDIRECT_ERR ||
      type === TokenType.REDIRECT_ERR_APPEND
    );
  }

  /**
   * Prüft ob Command zu Ende ist
   */
  private isCommandEnd(): boolean {
    const type = this.current().type;
    return (
      type === TokenType.PIPE ||
      type === TokenType.BACKGROUND ||
      type === TokenType.SEMICOLON ||
      type === TokenType.AND ||
      type === TokenType.OR ||
      type === TokenType.NEWLINE ||
      type === TokenType.EOF
    );
  }

  /**
   * Erwartet Ende des Inputs
   */
  private expectEnd(): void {
    if (!this.isAtEnd() && this.current().type !== TokenType.EOF) {
      throw new ParseError(
        "Unexpected token at end of input",
        this.current(),
        this.state.position,
      );
    }
  }

  /**
   * Erwartetes Token-Type prüfen
   */
  private expect(expectedType: TokenType): Token {
    if (this.current().type !== expectedType) {
      throw new ParseError(
        `Expected ${expectedType}, got ${this.current().type}`,
        this.current(),
        this.state.position,
      );
    }
    const token = this.current();
    this.advance();
    return token;
  }

  /**
   * Environment-Variable-Substitution
   */
  private substituteVariables(value: string, environment: Environment): string {
    // Einfache Variable: $VAR
    let result = value.replace(/\$(\w+)/g, (match, varName) => {
      return environment[varName] || "";
    });

    // Erweiterte Variable: ${VAR} oder ${VAR:-default}
    result = result.replace(/\$\{([^}]+)\}/g, (match, expression) => {
      if (expression.includes(":-")) {
        const [varName, defaultValue] = expression.split(":-", 2);
        return environment[varName] || defaultValue;
      } else {
        return environment[expression] || "";
      }
    });

    return result;
  }

  /**
   * Glob-Pattern expandieren
   */
  private expandGlob(pattern: string): string[] {
    // Vereinfachte Glob-Expansion
    if (pattern.includes("*")) {
      // In real implementation, VFS would be searched here
      return [pattern]; // Fallback: Pattern as-is
    }
    return [pattern];
  }

  /**
   * Tilde-Expansion (~)
   */
  private expandTilde(path: string): string {
    if (path.startsWith("~/")) {
      return path.replace("~/", "/home/user/");
    } else if (path === "~") {
      return "/home/user";
    }
    return path;
  }

  /**
   * Command-Substitution $(command) oder `command`
   */
  private substituteCommands(value: string): string {
    // $(command) syntax
    let result = value.replace(/\$\(([^)]+)\)/g, (match, command) => {
      // In real implementation, command would be executed here
      return `[output of: ${command}]`;
    });

    // `command` syntax (backticks)
    result = result.replace(/`([^`]+)`/g, (match, command) => {
      // In real implementation, command would be executed here
      return `[output of: ${command}]`;
    });

    return result;
  }

  /**
   * Erweiterte Argument-Verarbeitung mit allen Shell-Features
   */
  private processAdvancedArguments(
    args: CommandArgs,
    environment: Environment,
  ): CommandArgs {
    const processed: CommandArgs = [];

    for (const arg of args) {
      let processedArg = arg;

      // 1. Tilde-Expansion
      processedArg = this.expandTilde(processedArg);

      // 2. Variable-Substitution
      processedArg = this.substituteVariables(processedArg, environment);

      // 3. Command-Substitution
      processedArg = this.substituteCommands(processedArg);

      // 4. Glob-Expansion
      const globExpanded = this.expandGlob(processedArg);
      processed.push(...globExpanded);
    }

    return processed;
  }

  /**
   * Debug-Information für Token-Stream
   */
  debug(): object {
    return {
      tokens: this.state.tokens,
      position: this.state.position,
      current: this.state.current,
    };
  }
}
