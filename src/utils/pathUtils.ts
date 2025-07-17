/**
 * VFS Path Utilities
 */

import { Path } from "../types/index.js";

export class PathUtils {
  /**
   * Normalisiert einen Pfad und entfernt redundante Segmente
   */
  static normalize(path: Path): Path {
    if (!path || path === "") {
      return "/";
    }

    // Ensure absolute path
    if (!path.startsWith("/")) {
      throw new Error("Only absolute paths are supported");
    }

    const parts = path.split("/").filter((part) => part.length > 0);
    const resolved: string[] = [];

    for (const part of parts) {
      if (part === "..") {
        resolved.pop();
      } else if (part !== ".") {
        resolved.push(part);
      }
    }

    return "/" + resolved.join("/");
  }

  /**
   * Verbindet mehrere Pfad-Segmente
   */
  static join(...paths: string[]): Path {
    const joined = paths.filter((p) => p).join("/");
    return PathUtils.normalize(joined);
  }

  /**
   * Gibt das Verzeichnis eines Pfades zurück
   */
  static dirname(path: Path): Path {
    const resolved = PathUtils.normalize(path);
    const lastSlash = resolved.lastIndexOf("/");
    if (lastSlash === 0) return "/";
    return resolved.substring(0, lastSlash);
  }

  /**
   * Gibt den Dateinamen eines Pfades zurück
   */
  static basename(path: Path, ext?: string): string {
    const resolved = PathUtils.normalize(path);
    const lastSlash = resolved.lastIndexOf("/");
    let basename = resolved.substring(lastSlash + 1);

    if (ext && basename.endsWith(ext)) {
      basename = basename.substring(0, basename.length - ext.length);
    }

    return basename;
  }

  /**
   * Gibt die Dateierweiterung zurück
   */
  static extname(path: Path): string {
    const basename = PathUtils.basename(path);
    const lastDot = basename.lastIndexOf(".");
    return lastDot > 0 ? basename.substring(lastDot) : "";
  }

  /**
   * Prüft ob ein Pfad absolut ist
   */
  static isAbsolute(path: Path): boolean {
    return path.startsWith("/");
  }

  /**
   * Macht einen Pfad relativ zu einem Basispfad
   */
  static relative(from: Path, to: Path): string {
    const fromParts = PathUtils.normalize(from).split("/").filter(Boolean);
    const toParts = PathUtils.normalize(to).split("/").filter(Boolean);

    // Find common prefix
    let commonLength = 0;
    const minLength = Math.min(fromParts.length, toParts.length);

    for (let i = 0; i < minLength; i++) {
      if (fromParts[i] === toParts[i]) {
        commonLength++;
      } else {
        break;
      }
    }

    // Go up from 'from' to common ancestor
    const upSteps = fromParts.length - commonLength;
    const upPath = "../".repeat(upSteps);

    // Go down from common ancestor to 'to'
    const downParts = toParts.slice(commonLength);
    const downPath = downParts.join("/");

    return upPath + downPath || ".";
  }

  /**
   * Auflösung eines Pfades relativ zu einem Basispfad
   */
  static resolve(basePath: Path, ...paths: string[]): Path {
    let resolved = PathUtils.normalize(basePath);

    for (const path of paths) {
      if (PathUtils.isAbsolute(path)) {
        resolved = PathUtils.normalize(path);
      } else {
        resolved = PathUtils.join(resolved, path);
      }
    }

    return resolved;
  }

  /**
   * Prüft ob ein Pfad ein Unterpfad eines anderen ist
   */
  static isSubPath(parent: Path, child: Path): boolean {
    const normalizedParent = PathUtils.normalize(parent);
    const normalizedChild = PathUtils.normalize(child);

    if (normalizedParent === "/") {
      return true; // Root is parent of everything
    }

    return (
      normalizedChild.startsWith(normalizedParent + "/") ||
      normalizedChild === normalizedParent
    );
  }

  /**
   * Erstellt einen gültigen Dateinamen
   */
  static sanitizeFilename(name: string): string {
    // Remove invalid characters
    return name
      .replace(/[<>:"/\\|?*\x00-\x1f]/g, "_")
      .replace(/^\.+$/, "_")
      .substring(0, 255);
  }

  /**
   * Glob-Pattern zu RegExp konvertieren (vereinfacht)
   */
  static globToRegex(pattern: string): RegExp {
    const escaped = pattern
      .replace(/[.+^${}()|[\]\\]/g, "\\$&") // Escape special regex chars
      .replace(/\*/g, ".*") // * becomes .*
      .replace(/\?/g, "."); // ? becomes .

    return new RegExp(`^${escaped}$`);
  }

  /**
   * Pfad-Tiefe ermitteln
   */
  static depth(path: Path): number {
    const normalized = PathUtils.normalize(path);
    if (normalized === "/") return 0;
    return normalized.split("/").filter(Boolean).length;
  }
}
