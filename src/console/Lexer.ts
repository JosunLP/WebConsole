/**
 * Command lexer for the Web Console
 * Splits input strings into tokens
 */

/**
 * Token types
 */
export enum TokenType {
  WORD = "WORD",
  STRING = "STRING",
  PIPE = "PIPE",
  REDIRECT_OUT = "REDIRECT_OUT",
  REDIRECT_APPEND = "REDIRECT_APPEND",
  REDIRECT_IN = "REDIRECT_IN",
  REDIRECT_ERR = "REDIRECT_ERR",
  REDIRECT_ERR_APPEND = "REDIRECT_ERR_APPEND",
  BACKGROUND = "BACKGROUND",
  SEMICOLON = "SEMICOLON",
  AND = "AND",
  OR = "OR",
  SUBSHELL_START = "SUBSHELL_START",
  SUBSHELL_END = "SUBSHELL_END",
  VARIABLE = "VARIABLE",
  ASSIGNMENT = "ASSIGNMENT",
  WHITESPACE = "WHITESPACE",
  NEWLINE = "NEWLINE",
  EOF = "EOF",
}

/**
 * Token structure
 */
export interface Token {
  type: TokenType;
  value: string;
  position: number;
  line: number;
  column: number;
}

/**
 * Lexer state
 */
interface LexerState {
  input: string;
  position: number;
  line: number;
  column: number;
  current: string;
}

/**
 * Command lexer implementation
 */
export class Lexer {
  private state: LexerState;

  constructor(input: string) {
    this.state = {
      input,
      position: 0,
      line: 1,
      column: 1,
      current: input[0] || "",
    };
  }

  /**
   * Extract all tokens from the input
   */
  tokenize(): Token[] {
    const tokens: Token[] = [];

    while (!this.isAtEnd()) {
      const token = this.nextToken();
      if (token) {
        tokens.push(token);
      }
    }

    // Add EOF token
    tokens.push({
      type: TokenType.EOF,
      value: "",
      position: this.state.position,
      line: this.state.line,
      column: this.state.column,
    });

    return tokens;
  }

  /**
   * Read next token
   */
  private nextToken(): Token | null {
    this.skipWhitespace();

    if (this.isAtEnd()) {
      return null;
    }

    const position = this.state.position;
    const line = this.state.line;
    const column = this.state.column;

    // Skip comments
    if (this.current() === "#") {
      this.skipComment();
      return this.nextToken();
    }

    // Newline
    if (this.current() === "\n") {
      this.advance();
      return {
        type: TokenType.NEWLINE,
        value: "\n",
        position,
        line,
        column,
      };
    }

    // Strings (with quotes)
    if (this.current() === '"' || this.current() === "'") {
      return this.readString(position, line, column);
    }

    // Pipe
    if (this.current() === "|") {
      if (this.peek() === "|") {
        this.advance();
        this.advance();
        return {
          type: TokenType.OR,
          value: "||",
          position,
          line,
          column,
        };
      }
      this.advance();
      return {
        type: TokenType.PIPE,
        value: "|",
        position,
        line,
        column,
      };
    }

    // Redirections
    if (this.current() === ">") {
      if (this.peek() === ">") {
        this.advance();
        this.advance();
        return {
          type: TokenType.REDIRECT_APPEND,
          value: ">>",
          position,
          line,
          column,
        };
      }
      this.advance();
      return {
        type: TokenType.REDIRECT_OUT,
        value: ">",
        position,
        line,
        column,
      };
    }

    if (this.current() === "<") {
      this.advance();
      return {
        type: TokenType.REDIRECT_IN,
        value: "<",
        position,
        line,
        column,
      };
    }

    // Error redirection (2>, 2>>)
    if (this.current() === "2") {
      if (this.peek() === ">") {
        this.advance(); // 2
        this.advance(); // >
        if (this.current() === ">") {
          this.advance(); // second >
          return {
            type: TokenType.REDIRECT_ERR_APPEND,
            value: "2>>",
            position,
            line,
            column,
          };
        }
        return {
          type: TokenType.REDIRECT_ERR,
          value: "2>",
          position,
          line,
          column,
        };
      }
    }

    // Background
    if (this.current() === "&") {
      if (this.peek() === "&") {
        this.advance();
        this.advance();
        return {
          type: TokenType.AND,
          value: "&&",
          position,
          line,
          column,
        };
      }
      this.advance();
      return {
        type: TokenType.BACKGROUND,
        value: "&",
        position,
        line,
        column,
      };
    }

    // Semicolon
    if (this.current() === ";") {
      this.advance();
      return {
        type: TokenType.SEMICOLON,
        value: ";",
        position,
        line,
        column,
      };
    }

    // Subshell
    if (this.current() === "(") {
      this.advance();
      return {
        type: TokenType.SUBSHELL_START,
        value: "(",
        position,
        line,
        column,
      };
    }

    if (this.current() === ")") {
      this.advance();
      return {
        type: TokenType.SUBSHELL_END,
        value: ")",
        position,
        line,
        column,
      };
    }

    // Variable or assignment
    if (this.current() === "$") {
      return this.readVariable(position, line, column);
    }

    // Word (default)
    return this.readWord(position, line, column);
  }

  /**
   * Read string token (with quotes)
   */
  private readString(position: number, line: number, column: number): Token {
    const quote = this.current();
    this.advance(); // Skip opening quote

    let value = "";
    while (!this.isAtEnd() && this.current() !== quote) {
      if (this.current() === "\\" && this.peek() === quote) {
        this.advance(); // Skip escape character
        value += this.current();
        this.advance();
      } else {
        value += this.current();
        this.advance();
      }
    }

    if (this.current() === quote) {
      this.advance(); // Skip closing quote
    }

    return {
      type: TokenType.STRING,
      value,
      position,
      line,
      column,
    };
  }

  /**
   * Read variable token
   */
  private readVariable(position: number, line: number, column: number): Token {
    this.advance(); // Skip $

    let value = "$";

    // Curly braces for ${VAR}
    if (this.current() === "{") {
      value += this.current();
      this.advance();

      while (!this.isAtEnd() && this.current() !== "}") {
        value += this.current();
        this.advance();
      }

      if (this.current() === "}") {
        value += this.current();
        this.advance();
      }
    } else {
      // Simple variable $VAR
      while (!this.isAtEnd() && this.isVariableChar(this.current())) {
        value += this.current();
        this.advance();
      }
    }

    return {
      type: TokenType.VARIABLE,
      value,
      position,
      line,
      column,
    };
  }

  /**
   * Read word token
   */
  private readWord(position: number, line: number, column: number): Token {
    let value = "";

    while (!this.isAtEnd() && !this.isDelimiter(this.current())) {
      // Detect assignment (VAR=value)
      if (
        this.current() === "=" &&
        value.length > 0 &&
        this.isValidVariableName(value)
      ) {
        // Create assignment token
        const assignmentValue = value + "=";
        this.advance(); // Skip =

        // Read value
        while (!this.isAtEnd() && !this.isDelimiter(this.current())) {
          assignmentValue + this.current();
          this.advance();
        }

        return {
          type: TokenType.ASSIGNMENT,
          value: assignmentValue,
          position,
          line,
          column,
        };
      }

      value += this.current();
      this.advance();
    }

    return {
      type: TokenType.WORD,
      value,
      position,
      line,
      column,
    };
  }

  /**
   * Skip whitespace
   */
  private skipWhitespace(): void {
    while (
      !this.isAtEnd() &&
      this.isWhitespace(this.current()) &&
      this.current() !== "\n"
    ) {
      this.advance();
    }
  }

  /**
   * Skip comment
   */
  private skipComment(): void {
    while (!this.isAtEnd() && this.current() !== "\n") {
      this.advance();
    }
  }

  /**
   * Next character in input
   */
  private advance(): void {
    if (this.state.current === "\n") {
      this.state.line++;
      this.state.column = 1;
    } else {
      this.state.column++;
    }

    this.state.position++;
    this.state.current = this.state.input[this.state.position] || "";
  }

  /**
   * Current character
   */
  private current(): string {
    return this.state.current;
  }

  /**
   * Peek next character (without consuming)
   */
  private peek(): string {
    return this.state.input[this.state.position + 1] || "";
  }

  /**
   * Check if at end of input
   */
  private isAtEnd(): boolean {
    return this.state.position >= this.state.input.length;
  }

  /**
   * Check if character is a delimiter
   */
  private isDelimiter(char: string): boolean {
    return (
      this.isWhitespace(char) ||
      char === "|" ||
      char === ">" ||
      char === "<" ||
      char === "&" ||
      char === ";" ||
      char === "(" ||
      char === ")" ||
      char === "\n" ||
      char === "#"
    );
  }

  /**
   * Check if character is whitespace
   */
  private isWhitespace(char: string): boolean {
    return char === " " || char === "\t" || char === "\r";
  }

  /**
   * Check if character is valid for variable name
   */
  private isVariableChar(char: string): boolean {
    return /[a-zA-Z0-9_]/.test(char);
  }

  /**
   * Check if string is a valid variable name
   */
  private isValidVariableName(name: string): boolean {
    return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name);
  }
}
