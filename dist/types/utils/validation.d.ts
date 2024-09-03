/**
 * Validates given path is an accessible directory.  If a given path is valid, the promise fulfills with no value.  Otherwise the promise rejects with an error.
 * @param dir - The directory path to validate.
 * @returns Promise<void> - Resolves when the directory path is valid.
 */
export declare const validateSrcDir: (srcDir: string) => Promise<void>;
/**
 * Validates destination directory that it's a valid directory and writable.  If the path is valid promise fullfills with no value.  Otherwise the promise rejects with an error.
 * @param dstDir - The destination directory.
 * @returns Promise<boolean> - Resolves when the destination directory is valid.
 */
export declare const validateDstDir: (dstDir: string) => Promise<boolean>;
/**
 * Validates source and destination directories that they are valid, readable, and writable.  If the path is valid promise fullfills with no value.  Otherwise the promise rejects with an error.
 * @param srcDir - The source directory.
 * @param dstDir - The destination directory.
 * @returns Promise<void> - Resolves when the source and destination directories are valid.
 */
export declare const validatetDirs: (srcDir: string, dstDir: string) => Promise<void>;
//# sourceMappingURL=validation.d.ts.map