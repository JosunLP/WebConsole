/**
 * date - Display or set the system date
 */

import { ExitCode } from "../../enums/index.js";
import { CommandContext } from "../../types/index.js";
import { BaseCommand } from "../BaseCommand.js";

export class DateCommand extends BaseCommand {
  constructor() {
    super(
      "date",
      "Display the current date and time",
      "date [OPTION]... [+FORMAT]",
    );
  }

  async execute(context: CommandContext): Promise<ExitCode> {
    if (this.hasHelpFlag(context)) {
      await this.outputHelp(context);
      return ExitCode.SUCCESS;
    }

    const { flags, positional } = this.parseArgs(context);

    // Check for format string
    const formatArg = positional.find((arg) => arg.startsWith("+"));
    const format = formatArg ? formatArg.substring(1) : undefined;

    // -u, --utc: use UTC time
    const useUtc = flags.has("u") || flags.has("utc");

    // -R, --rfc-2822: RFC 2822 format
    const rfc2822 = flags.has("R") || flags.has("rfc-2822");

    // -I, --iso-8601: ISO 8601 format
    const iso8601 = flags.has("I") || flags.has("iso-8601");

    try {
      const now = new Date();
      let output: string;

      if (rfc2822) {
        output = this.formatRFC2822(now, useUtc);
      } else if (iso8601) {
        output = this.formatISO8601(now, useUtc);
      } else if (format) {
        output = this.formatCustom(now, format, useUtc);
      } else {
        // Default format: "Wed Oct  5 14:39:13 PDT 2011"
        output = this.formatDefault(now, useUtc);
      }

      await this.writeToStdout(context, `${output}\n`);
      return ExitCode.SUCCESS;
    } catch (error) {
      await this.writeToStderr(context, `date: ${error}\n`);
      return ExitCode.FAILURE;
    }
  }

  private formatDefault(date: Date, utc: boolean): string {
    const d = utc ? new Date(date.getTime()) : date;
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const weekday = weekdays[utc ? d.getUTCDay() : d.getDay()];
    const month = months[utc ? d.getUTCMonth() : d.getMonth()];
    const day = (utc ? d.getUTCDate() : d.getDate()).toString().padStart(2);
    const hours = (utc ? d.getUTCHours() : d.getHours())
      .toString()
      .padStart(2, "0");
    const minutes = (utc ? d.getUTCMinutes() : d.getMinutes())
      .toString()
      .padStart(2, "0");
    const seconds = (utc ? d.getUTCSeconds() : d.getSeconds())
      .toString()
      .padStart(2, "0");
    const year = utc ? d.getUTCFullYear() : d.getFullYear();
    const timezone = utc ? "UTC" : this.getTimezone(d);

    return `${weekday} ${month} ${day} ${hours}:${minutes}:${seconds} ${timezone} ${year}`;
  }

  private formatRFC2822(date: Date, utc: boolean): string {
    if (utc) {
      return date.toUTCString();
    }
    return date.toString();
  }

  private formatISO8601(date: Date, utc: boolean): string {
    if (utc) {
      return date.toISOString();
    }
    // Local ISO format
    const offset = -date.getTimezoneOffset();
    const sign = offset >= 0 ? "+" : "-";
    const hours = Math.floor(Math.abs(offset) / 60)
      .toString()
      .padStart(2, "0");
    const minutes = (Math.abs(offset) % 60).toString().padStart(2, "0");

    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const hour = date.getHours().toString().padStart(2, "0");
    const min = date.getMinutes().toString().padStart(2, "0");
    const sec = date.getSeconds().toString().padStart(2, "0");

    return `${year}-${month}-${day}T${hour}:${min}:${sec}${sign}${hours}:${minutes}`;
  }

  private formatCustom(date: Date, format: string, utc: boolean): string {
    const d = utc ? new Date(date.getTime()) : date;

    // Common format specifiers
    const formatMap: Record<string, string> = {
      Y: (utc ? d.getUTCFullYear() : d.getFullYear()).toString(),
      m: (utc ? d.getUTCMonth() + 1 : d.getMonth() + 1)
        .toString()
        .padStart(2, "0"),
      d: (utc ? d.getUTCDate() : d.getDate()).toString().padStart(2, "0"),
      H: (utc ? d.getUTCHours() : d.getHours()).toString().padStart(2, "0"),
      M: (utc ? d.getUTCMinutes() : d.getMinutes()).toString().padStart(2, "0"),
      S: (utc ? d.getUTCSeconds() : d.getSeconds()).toString().padStart(2, "0"),
      s: Math.floor(date.getTime() / 1000).toString(),
      N: ((date.getTime() % 1000) * 1000000).toString().padStart(9, "0"),
    };

    return format.replace(/%([YmdHMSsN%])/g, (match, spec) => {
      if (spec === "%") return "%";
      return formatMap[spec] || match;
    });
  }

  private getTimezone(date: Date): string {
    // Simple timezone detection
    const offset = -date.getTimezoneOffset();
    const sign = offset >= 0 ? "+" : "-";
    const hours = Math.floor(Math.abs(offset) / 60)
      .toString()
      .padStart(2, "0");
    const minutes = (Math.abs(offset) % 60).toString().padStart(2, "0");
    return `${sign}${hours}${minutes}`;
  }

  protected getDetailedHelp(): string {
    return `
Display the current date and time.

Options:
  -u, --utc            display time in UTC
  -R, --rfc-2822       output date and time in RFC 2822 format
  -I, --iso-8601       output date/time in ISO 8601 format

Format:
  +FORMAT              output date according to FORMAT

Common FORMAT sequences:
  %Y    year (e.g., 2023)
  %m    month (01..12)
  %d    day of month (01..31)
  %H    hour (00..23)
  %M    minute (00..59)
  %S    second (00..60)
  %s    seconds since epoch
  %N    nanoseconds
  %%    literal %

Examples:
  date                    # Default format
  date -u                 # UTC time
  date -R                 # RFC 2822 format
  date -I                 # ISO 8601 format
  date +"%Y-%m-%d"        # Custom format: 2023-12-25
  date +"%H:%M:%S"        # Time only: 14:30:00

Exit Status:
  0    if successful
  1    if an error occurred
`;
  }
}
