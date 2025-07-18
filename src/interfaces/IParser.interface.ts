/**
 * Parser Interface
 */

import { ParsedCommand } from "../types/index.js";

export interface IParser {
  parse(input: string): ParsedCommand;
  tokenize(input: string): string[];

  // Extensions
  addOperator(operator: string, precedence: number): void;
  addFunction(name: string, handler: Function): void;
}
