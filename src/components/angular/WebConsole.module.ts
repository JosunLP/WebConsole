/**
 * Angular Module für Web-Console
 */

import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { WebConsoleComponent } from "./WebConsole.component.js";

@NgModule({
  declarations: [WebConsoleComponent],
  imports: [CommonModule],
  exports: [WebConsoleComponent],
  providers: [],
})
export class WebConsoleModule {}
