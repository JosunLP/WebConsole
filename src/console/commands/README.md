# Built-in Commands

Diese Datei dokumentiert alle implementierten Built-in Commands der Web-Console.

## Dateisystem-Befehle

### `ls` - List Directory Contents
- **Beschreibung**: Zeigt den Inhalt von Verzeichnissen an
- **Syntax**: `ls [OPTION]... [FILE]...`
- **Optionen**:
  - `-l`: Langes Format mit Details
  - `-a`: Alle Dateien anzeigen (inklusive versteckte)
  - `-A`: Alle Dateien außer . und ..
  - `-1`: Eine Datei pro Zeile
  - `--color`: Farbige Ausgabe

### `cd` - Change Directory
- **Beschreibung**: Wechselt das aktuelle Arbeitsverzeichnis
- **Syntax**: `cd [DIRECTORY]`
- **Spezielle Pfade**:
  - `cd` oder `cd ~`: Zu Home-Verzeichnis
  - `cd -`: Zum vorherigen Verzeichnis
  - `cd ..`: Zum übergeordneten Verzeichnis

### `pwd` - Print Working Directory
- **Beschreibung**: Zeigt das aktuelle Arbeitsverzeichnis an
- **Syntax**: `pwd [OPTION]`
- **Optionen**:
  - `-L`: Logischer Pfad (Standard)
  - `-P`: Physischer Pfad (Links aufgelöst)

### `cat` - Display File Contents
- **Beschreibung**: Zeigt Dateiinhalte an
- **Syntax**: `cat [OPTION]... [FILE]...`
- **Optionen**:
  - `-n, --number`: Zeilen nummerieren
  - `-b, --number-nonblank`: Nur nicht-leere Zeilen nummerieren
  - `-E, --show-ends`: Zeilenendes mit $ markieren
  - `-T, --show-tabs`: Tabs als ^I anzeigen
  - `-A, --show-all`: Alle nicht-druckbaren Zeichen anzeigen
  - `-s, --squeeze-blank`: Mehrere Leerzeilen komprimieren

## Utility-Befehle

### `echo` - Display Text
- **Beschreibung**: Gibt Text aus
- **Syntax**: `echo [OPTION]... [STRING]...`
- **Optionen**:
  - `-n`: Kein Zeilenendezeichen
  - `-e`: Escape-Sequenzen interpretieren
  - `-E`: Escape-Sequenzen nicht interpretieren (Standard)
- **Escape-Sequenzen**:
  - `\\n`: Zeilumbruch
  - `\\t`: Tabulator
  - `\\r`: Wagenrücklauf
  - `\\b`: Rücktaste
  - `\\a`: Warnsignal
  - `\\e`: Escape-Zeichen
  - `\\\\`: Backslash

### `clear` - Clear Terminal Screen
- **Beschreibung**: Löscht den Bildschirm
- **Syntax**: `clear`
- **ANSI-Sequenz**: `\\x1b[2J\\x1b[H`

## Umgebungs-Befehle

### `export` - Set Environment Variables
- **Beschreibung**: Setzt und verwaltet Umgebungsvariablen
- **Syntax**: `export [name[=value] ...]`
- **Optionen**:
  - `-p`: Alle Variablen anzeigen
- **Beispiele**:
  - `export PATH=/usr/bin:$PATH`
  - `export NODE_ENV=production`
  - `export -p` (alle Variablen anzeigen)

### `alias` - Command Aliases
- **Beschreibung**: Erstellt und verwaltet Befehlsaliase
- **Syntax**: `alias [-p] [name[=value] ...]`
- **Optionen**:
  - `-p`: Alle Aliase anzeigen
- **Beispiele**:
  - `alias ll='ls -la'`
  - `alias cls='clear'`
  - `alias` (alle Aliase anzeigen)

## Console-Befehle

### `theme` - Change Console Theme
- **Beschreibung**: Ändert das Console-Theme
- **Syntax**: `theme [THEME_NAME] | list | reset`
- **Verfügbare Themes**:
  - `default`: Standard schwarzer Hintergrund
  - `dark`: Dunkles VS Code Theme
  - `light`: Helles Theme
  - `matrix`: Matrix-Style grün auf schwarz
  - `solarized-dark`: Solarized Dark
  - `solarized-light`: Solarized Light
  - `monokai`: Monokai
  - `dracula`: Dracula
  - `nord`: Nord Theme
  - `github`: GitHub Theme
  - `terminal`: Terminal-Style
- **Befehle**:
  - `theme list`: Verfügbare Themes anzeigen
  - `theme reset`: Auf Standard-Theme zurücksetzen
  - `theme dark`: Theme wechseln

## Implementierungs-Details

### Base Command Funktionalität
Alle Commands erben von `BaseCommand` und bieten:
- Einheitliche Argument-Parsing
- ANSI-Farbunterstützung
- Hilfe-System
- Error-Handling
- stdin/stdout/stderr Verwaltung

### Farbunterstützung
```typescript
// ANSI Color Codes
colors = {
  reset: '\\x1b[0m',
  bright: '\\x1b[1m',
  red: '\\x1b[31m',
  green: '\\x1b[32m',
  yellow: '\\x1b[33m',
  blue: '\\x1b[34m',
  magenta: '\\x1b[35m',
  cyan: '\\x1b[36m',
  white: '\\x1b[37m'
}
```

### VFS Integration
Commands wie `ls`, `cd`, und `cat` integrieren sich nahtlos mit dem Virtual File System:
- Pfadauflösung mit `vfs.resolvePath()`
- Dateioperationen mit `vfs.readFile()`, `vfs.stat()`
- Verzeichnisoperationen mit `vfs.readDir()`

### State Management
Commands nutzen den StateManager für:
- Environment-Variablen
- Current Working Directory
- Theme-Einstellungen
- Aliase

### Event System
Commands emittieren Events für:
- Theme-Änderungen (`THEME_CHANGED`)
- Verzeichniswechsel (`DIRECTORY_CHANGED`)
- Command-Ausführung (`COMMAND_COMPLETED`)

## Error Handling

Alle Commands folgen POSIX Exit Codes:
- `0`: Erfolg
- `1`: Allgemeiner Fehler
- `2`: Ungültige Verwendung
- `127`: Befehl nicht gefunden

## Performance Optimierungen

- Lazy Loading von Command-Modulen
- Streaming für große Dateioperationen
- Efficient Path Resolution
- Minimal Memory Footprint für Theme-Wechsel

## Testing

Jeder Command kann einzeln getestet werden:
```typescript
const command = new LsCommand(vfs);
const result = await command.execute(context);
assert.equal(result, ExitCode.SUCCESS);
```
