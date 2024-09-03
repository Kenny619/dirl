import type { Filters } from "./types/type.js";
declare class DirlGet {
    /**
     * Returns a list of file paths under the root directory.
     * @param  rootDir - The root directory to search for files.
     * @param  filters - {dir: string, file: string, ext: string}  Regular Expressions strings that match against direrctory path, filename, and file extension for selecting source files.   If multiple properties are specified, all properties must match for the file to pass the filter.
     * @returns  A promise that resolves to an array of file paths.
     */
    filePaths(rootDir: string, filters?: Filters): Promise<string[]>;
    /**
     * Returns a list of directory paths under the root directory.
     * @param  rootDir - The root directory to search for directories.
     * @param  filters - {dir: string, file: string, ext: string}  Regular Expressions strings that match against direrctory path, filename, and file extension for selecting source files.   If multiple properties are specified, all properties must match for the file to pass the filter.
     * @returns  A promise that resolves to an array of directory paths.
     */
    dirPaths(rootDir: string, filters?: Filters): Promise<string[]>;
    /**
     * Returns the number of files found under the root directory.
     * @param  rootDir - The root directory to search for files.
     * @param  filters - {dir: string, file: string, ext: string}  Regular Expressions strings that match against direrctory path, filename, and file extension for selecting source files.   If multiple properties are specified, all properties must match for the file to pass the filter.
     * @returns  A promise that resolves to the number of files.
     */
    fileCount(rootDir: string, filters?: Filters): Promise<number>;
    /**
     * Returns a list of file sizes under the root directory.
     * @param  rootDir - The root directory to search for files.
     * @param  filters - {dir: string, file: string, ext: string}  Regular Expressions strings that match against direrctory path, filename, and file extension for selecting source files.   If multiple properties are specified, all properties must match for the file to pass the filter.
     * @param  mode - "int" or "str"  "int" returns the file size bytes in numbers, and "str" returns the file size bytes using metric prefixes (kB, MB, GB, etc.).  Default is "str".
     * @returns  A promise that resolves to an array of objects with file path and size properties.
     */
    fileSizes(rootDir: string, filters?: Filters, mode?: "int" | "str"): Promise<{
        path: string;
        size: string | number;
    }[]>;
    /**
     * Returns a list of directory sizes under the root directory.  Each directory size include the size of all files and subdirectories under that directory.
     * @param  rootDir - The root directory to search for directories.
     * @param  filters - {dir: string, file: string, ext: string}  Regular Expressions strings that match against direrctory path, filename, and file extension for selecting source files.   If multiple properties are specified, all properties must match for the file to pass the filter.
     * @param  mode - "int" or "str"  "int" returns the file size bytes in numbers, and "str" returns the file size bytes using metric prefixes (kB, MB, GB, etc.).  Default is "str".
     * @returns  A promise that resolves to an array of objects with directory path and size properties.
     */
    dirSizes(rootDir: string, filters?: Filters, mode?: "int" | "str"): Promise<{
        path: string;
        size: string | number;
    }[]>;
    /**
     * Returns a list of duplicate files found under the root directory.
     * @param  rootDir - The root directory to search for duplicate files.
     * @param  filters - {dir: string, file: string, ext: string}  Regular Expressions strings that match against direrctory path, filename, and file extension for selecting source files.   If multiple properties are specified, all properties must match for the file to pass the filter.
     * @returns  A promise that resolves to an array of duplicate paths.  Each array element is an array of duplicate file paths.
     */
    duplicateFiles(rootDir: string, filters?: Filters): Promise<string[][]>;
}
export default DirlGet;
//# sourceMappingURL=get.d.ts.map