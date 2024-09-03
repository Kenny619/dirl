import type { Filters, ReturnFormat } from "../types/type.js";
/**
 * Returns a list of file sizes under the root directory. Returns an empty array if the directory tree had no files.
 * @param {string} rootDir - The root directory to search for files.
 * @param {Filters} filters - {dir: string, file: string, ext: string}  Strings of Regular Expressions that match against direrctory path, filename, and file extension for filtering in the file paths.   If multiple properties are specified, all properties must match for the file to pass the filter.
 * @param {"int" | "str"} mode - "int" or "str"  "int" returns the file size in bytes and "str" returns the file size using metric prefixes (kB, MB, GB, etc.).  Default is "str".
 * @returns A promise that resolves to an array of file sizes.
 */
export declare const getFileSizes: <T extends "int" | "str">(rootDir: string, filters?: Filters, mode?: T) => Promise<ReturnFormat<{
    path: string;
    size: T extends "int" ? number : string;
}[]>>;
/**
 * Returns a list of directory sizes under the root directory.
 * @param {string} rootDir - The root directory to search for directories.
 * @param {Filters} filters - {dir: string, file: string, ext: string}  Strings of Regular Expressions that match against direrctory path, filename, and file extension for filtering in the file paths.   If multiple properties are specified, all properties must match for the file to pass the filter.
 * @param {"int" | "str"} mode - "int" or "str"  "int" returns the directory size in bytes and "str" returns the directory size using metric prefixes (kB, MB, GB, etc.).  Default is "str".
 * @returns {dir: string, size: string | number}[] A promise that resolves to an array of objects with directory path and size properties.
 */
export declare const getDirSizes: <T extends "int" | "str">(rootDir: string, filters?: Filters, mode?: "int" | "str") => Promise<ReturnFormat<{
    path: string;
    size: string | number;
}[]>>;
/**
 * Returns a list of duplicate files found under the root directory.
 * @param {string} rootDir - The root directory to search for duplicate files.
 * @param {Filters} filters - {dir: string, file: string, ext: string}  "dir" and "file" filters are checked against the directory and file name respectively.  "ext" filter is checked against the file extension.  If multiple properties are specified, all properties must match for the file to pass the filter.
 * @returns {string[][]} A promise that resolves to an array of duplicate paths.  Each array element is an array of duplicate file paths.
 */
export declare const getDuplicates: (rootDir: string, filters?: Filters) => Promise<ReturnFormat<string[][]>>;
//# sourceMappingURL=baseGet.d.ts.map