/**
 * Command-Lexer für die Web-Console
 * Zerlegt Eingabe-Strings in Tokens
 */

/**
 * Token-Typen
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
 * Token-Struktur
 */
export interface Token {
  type: TokenType;
  value: string;
  position: number;
  line: number;
  column: number;
}

/**
 * Lexer-Zustand
 */
interface LexerState {
  input: string;
  position: number;
  line: number;
  column: number;
  current: string;
}

/**
 * Command-Lexer Implementierung
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
   * Alle Tokens aus dem Input extrahieren
   */
  tokenize(): Token[] {
    const tokens: Token[] = [];

    while (!this.isAtEnd()) {
      const token = this.nextToken();
      if (token) {
        tokens.push(token);
      }
    }

    // EOF-Token hinzufügen
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
   * Nächstes Token lesen
   */
  private nextToken(): Token | null {
    this.skipWhitespace();

    if (this.isAtEnd()) {
      return null;
    }

    const position = this.state.position;
    const line = this.state.line;
    const column = this.state.column;

    // Kommentare überspringen
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

    // Strings (mit Anführungszeichen)
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

    // Error Redirection (2>, 2>>)
    if (this.current() === "2") {
      if (this.peek() === ">") {
        this.advance(); // 2
        this.advance(); // >
        if (this.current() === ">") {
          this.advance(); // zweites >
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

    // Variable oder Assignment
    if (this.current() === "$") {
      return this.readVariable(position, line, column);
    }

    // Word (default)
    return this.readWord(position, line, column);
  }

  /**
   * String-Token lesen (mit Anführungszeichen)
   */
  private readString(position: number, line: number, column: number): Token {
    const quote = this.current();
    this.advance(); // Öffnendes Anführungszeichen überspringen

    let value = "";
    while (!this.isAtEnd() && this.current() !== quote) {
      if (this.current() === "\\" && this.peek() === quote) {
        this.advance(); // Escape-Zeichen überspringen
        value += this.current();
        this.advance();
      } else {
        value += this.current();
        this.advance();
      }
    }

    if (this.current() === quote) {
      this.advance(); // Schließendes Anführungszeichen überspringen
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
   * Variable-Token lesen
   */
  private readVariable(position: number, line: number, column: number): Token {
    this.advance(); // $ überspringen

    let value = "$";

    // Geschweifte Klammern für ${VAR}
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
      // Einfache Variable $VAR
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
   * Word-Token lesen
   */
  private readWord(position: number, line: number, column: number): Token {
    let value = "";

    while (!this.isAtEnd() && !this.isDelimiter(this.current())) {
      // Assignment erkennen (VAR=value)
      if (
        this.current() === "=" &&
        value.length > 0 &&
        this.isValidVariableName(value)
      ) {
        // Assignment-Token erstellen
        const assignmentValue = value + "=";
        this.advance(); // = überspringen

        // Wert lesen
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
   * Whitespace überspringen
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
   * Kommentar überspringen
   */
  private skipComment(): void {
    while (!this.isAtEnd() && this.current() !== "\n") {
      this.advance();
    }
  }

  /**
   * Nächstes Zeichen im Input
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
   * Aktuelles Zeichen
   */
  private current(): string {
    return this.state.current;
  }

  /**
   * Nächstes Zeichen (ohne zu konsumieren)
   */
  private peek(): string {
    return this.state.input[this.state.position + 1] || "";
  }

  /**
   * Prüft ob am Ende des Inputs
   */
  private isAtEnd(): boolean {
    return this.state.position >= this.state.input.length;
  }

  /**
   * Prüft ob Zeichen ein Delimiter ist
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
   * Prüft ob Zeichen Whitespace ist
   */
  private isWhitespace(char: string): boolean {
    return char === " " || char === "\t" || char === "\r";
  }

  /**
   * Prüft ob Zeichen für Variable-Namen gültig ist
   */
  private isVariableChar(char: string): boolean {
    return /[a-zA-Z0-9_]/.test(char);
  }

  /**
   * Prüft ob String ein gültiger Variable-Name ist
   */
  private isValidVariableName(name: string): boolean {
    return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name);
  }
}
