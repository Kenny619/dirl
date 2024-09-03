import type { Dirent } from "node:fs";
import type { Filters, ReturnFormat } from "../types/type.js";
/**
 * note:1
 * In order to avoid the rejection of fsp.readdir promise when meeting a file/directory that is not accessible,
 * fsp.readdir with recursive:true option is not being used.
 * Instead, #readdirRecursion is being called recursively to read file entries underneath absPath directory.
 *
 * note:2
 * System files defined in ignoreFiles e.g. .DS_Store for MacOS and Thumbs.db and Desktop.ini for Windows
 * are excluded from the file count.
 * Those files are also being excluded from the target of copy/move/flatten operations.
 *
 */
export declare const getDirents: (root: string, mode?: "dir" | "file" | "all", filters?: Filters) => Promise<ReturnFormat<Dirent[]>>;
/**
 * Get a list of paths of file system entries under root directory, including the root directory itself.
 * @param root - The directory to get the paths from.
 * @param mode - "dir" for directory only.  "file" for file only. "all" for both file and directory.
 * @param filters - The filters to apply to the paths.  Only paths that match the filters are returned.
 * @returns Promise<ReturnFormat<string[]>> - Resolves with the array of paths.
 */
export declare const getPaths: (root: string, mode?: "dir" | "file" | "all", filters?: Filters) => Promise<ReturnFormat<string[]>>;
/**
 * Checks for any files exising in a directory tree rooting from passed directory.  Returns true if the directory tree has no files.  Returns false if any of the directories contain files.
 * @param dir - The directory to check for emptiness.
 * @returns Promise<boolean> - Resolves with true if the directory and its subdirectories are empty, false otherwise.
 */
export declare const isDirTreeEmpty: (root: string) => Promise<boolean>;
//# sourceMappingURL=base.d.ts.map