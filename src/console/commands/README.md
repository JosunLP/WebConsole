# Built-in Commands

This file documents all implemented built-in commands of the Web Console.

## File System Commands

### `ls` - List Directory Contents

- **Description**: Displays the contents of directories
- **Syntax**: `ls [OPTION]... [FILE]...`
- **Options**:
  - `-l`: Long format with details
  - `-a`: Show all files (including hidden)
  - `-A`: All files except . and ..
  - `-1`: One file per line
  - `--color`: Colored output

### `cd` - Change Directory

- **Description**: Changes the current working directory
- **Syntax**: `cd [DIRECTORY]`
- **Special paths**:
  - `cd` or `cd ~`: To home directory
  - `cd -`: To previous directory
  - `cd ..`: To parent directory

### `pwd` - Print Working Directory

- **Description**: Shows the current working directory
- **Syntax**: `pwd [OPTION]`
- **Options**:
  - `-L`: Logical path (default)
  - `-P`: Physical path (resolves links)

### `cat` - Display File Contents

- **Description**: Displays file contents
- **Syntax**: `cat [OPTION]... [FILE]...`
- **Options**:
  - `-n, --number`: Number all lines
  - `-b, --number-nonblank`: Number non-blank lines only
  - `-E, --show-ends`: Mark line ends with $
  - `-T, --show-tabs`: Show tabs as ^I
  - `-A, --show-all`: Show all non-printable characters
  - `-s, --squeeze-blank`: Squeeze multiple blank lines

## Utility Commands

### `echo` - Display Text

- **Description**: Outputs text
- **Syntax**: `echo [OPTION]... [STRING]...`
- **Options**:
  - `-n`: No trailing newline
  - `-e`: Interpret escape sequences
  - `-E`: Do not interpret escape sequences (default)
- **Escape sequences**:
  - `\n`: Newline
  - `\t`: Tab
  - `\r`: Carriage return
  - `\b`: Backspace
  - `\a`: Bell
  - `\e`: Escape character
  - `\\`: Backslash

### `clear` - Clear Terminal Screen

- **Description**: Clears the screen
- **Syntax**: `clear`
- **ANSI sequence**: `\x1b[2J\x1b[H`

## Environment Commands

### `export` - Set Environment Variables

- **Description**: Sets and manages environment variables
- **Syntax**: `export [name[=value] ...]`
- **Options**:
  - `-p`: Show all variables
- **Examples**:
  - `export PATH=/usr/bin:$PATH`
  - `export NODE_ENV=production`
  - `export -p` (show all variables)

### `alias` - Command Aliases

- **Description**: Creates and manages command aliases
- **Syntax**: `alias [-p] [name[=value] ...]`
- **Options**:
  - `-p`: Show all aliases
- **Examples**:
  - `alias ll='ls -la'`
  - `alias cls='clear'`
  - `alias` (show all aliases)

## Console Commands

### `theme` - Change Console Theme

- **Description**: Changes the console theme
- **Syntax**: `theme [THEME_NAME] | list | reset`
- **Available themes**:
  - `default`: Standard black background
  - `dark`: Dark VS Code theme
  - `light`: Light theme
  - `matrix`: Matrix-style green on black
  - `solarized-dark`: Solarized Dark
  - `solarized-light`: Solarized Light
  - `monokai`: Monokai
  - `dracula`: Dracula
  - `nord`: Nord theme
  - `github`: GitHub theme
  - `terminal`: Terminal style
- **Commands**:
  - `theme list`: Show available themes
  - `theme reset`: Reset to default theme
  - `theme dark`: Switch theme

## Implementation Details

### Base Command Functionality

All commands inherit from `BaseCommand` and provide:

- Unified argument parsing
- ANSI color support
- Help system
- Error handling
- stdin/stdout/stderr management

### Color Support

```typescript
// ANSI Color Codes
colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
};
```

### VFS Integration

Commands like `ls`, `cd`, and `cat` integrate seamlessly with the virtual file system:

- Path resolution with `vfs.resolvePath()`
- File operations with `vfs.readFile()`, `vfs.stat()`
- Directory operations with `vfs.readDir()`

### State Management

Commands use the StateManager for:

- Environment variables
- Current working directory
- Theme settings
- Aliases

### Event System

Commands emit events for:

- Theme changes (`THEME_CHANGED`)
- Directory changes (`DIRECTORY_CHANGED`)
- Command execution (`COMMAND_COMPLETED`)

## Error Handling

All commands follow POSIX exit codes:

- `0`: Success
- `1`: General error
- `2`: Invalid usage
- `127`: Command not found

## Performance Optimizations

- Lazy loading of command modules
- Streaming for large file operations
- Efficient path resolution
- Minimal memory footprint for theme switching

## Testing

Each command can be tested individually:

```typescript
const command = new LsCommand(vfs);
const result = await command.execute(context);
assert.equal(result, ExitCode.SUCCESS);
```
