import type { Dirent } from "node:fs";
import type { Filters, ReturnFormat, MoveResults, Mode } from "../types/type.js";
export declare const transferFiles: (srcDir: string, dstDir: string, mode: Mode, filters: Filters) => Promise<ReturnFormat<MoveResults>>;
/**
 * Checks if a file can be copied/moved to a destination directory.  If movable, returns a promise of an object with srcFilePath, dstFilePath, and dirent properties.  Otherwise, returns null.
 * @param srcDir - The source directory.
 * @param dstDir - The destination directory.
 * @param dirent - The dirent object.
 * @param mode - "Overwrite" will always copy/move the file and overwrite the destination file if it exists.  "IfNew" will copy/move the source file if it doesn't exist in the destination, or overwrites the existing file in destination only if the source file is newer than the destination file.  "Diff" will copy/move the files only if it doesn't exist in the destination directory.
 * @returns Promise<{ srcFilePath: string; dstFilePath: string; dirent: Dirent } | null> - Resolves with an object with srcFilePath, dstFilePath, and dirent properties if the file can be copied/moved, or null otherwise.
 */
export declare const getMovableDirents: (srcDir: string, dstDir: string, dirent: Dirent, mode: Mode) => Promise<{
    srcFilePath: string;
    dstFilePath: string;
    dirent: Dirent;
} | null>;
export declare const delSrc: (srcPath: string, dirent: Dirent) => Promise<void>;
