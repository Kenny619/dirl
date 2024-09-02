import { getFileSizes, getDirSizes, getDuplicates } from "./utils/baseGet.js";
import { getPaths } from "./utils/base.js";
class DirlGet {
    /**
     * Returns a list of file paths under the root directory.
     * @param  rootDir - The root directory to search for files.
     * @param  filters - {dir: string, file: string, ext: string}  Regular Expressions strings that match against direrctory path, filename, and file extension for selecting source files.   If multiple properties are specified, all properties must match for the file to pass the filter.
     * @returns  A promise that resolves to an array of file paths.
     */
    async filePaths(rootDir, filters = {}) {
        const { data: filePaths, err } = await getPaths(rootDir, "file", filters);
        if (err !== null)
            throw err;
        return filePaths;
    }
    /**
     * Returns a list of directory paths under the root directory.
     * @param  rootDir - The root directory to search for directories.
     * @param  filters - {dir: string, file: string, ext: string}  Regular Expressions strings that match against direrctory path, filename, and file extension for selecting source files.   If multiple properties are specified, all properties must match for the file to pass the filter.
     * @returns  A promise that resolves to an array of directory paths.
     */
    async dirPaths(rootDir, filters = {}) {
        const { data: dirPaths, err } = await getPaths(rootDir, "dir", filters);
        if (err !== null)
            throw err;
        return dirPaths;
    }
    /**
     * Returns the number of files found under the root directory.
     * @param  rootDir - The root directory to search for files.
     * @param  filters - {dir: string, file: string, ext: string}  Regular Expressions strings that match against direrctory path, filename, and file extension for selecting source files.   If multiple properties are specified, all properties must match for the file to pass the filter.
     * @returns  A promise that resolves to the number of files.
     */
    async fileCount(rootDir, filters = {}) {
        const { data: filePaths, err } = await getPaths(rootDir, "file", filters);
        if (err !== null)
            throw err;
        return filePaths.length;
    }
    /**
     * Returns a list of file sizes under the root directory.
     * @param  rootDir - The root directory to search for files.
     * @param  filters - {dir: string, file: string, ext: string}  Regular Expressions strings that match against direrctory path, filename, and file extension for selecting source files.   If multiple properties are specified, all properties must match for the file to pass the filter.
     * @param  mode - "int" or "str"  "int" returns the file size bytes in numbers, and "str" returns the file size bytes using metric prefixes (kB, MB, GB, etc.).  Default is "str".
     * @returns  A promise that resolves to an array of objects with file path and size properties.
     */
    async fileSizes(rootDir, filters = {}, mode = "str") {
        const { data, err } = await getFileSizes(rootDir, filters, mode);
        if (err !== null)
            throw err;
        return data;
    }
    /**
     * Returns a list of directory sizes under the root directory.  Each directory size include the size of all files and subdirectories under that directory.
     * @param  rootDir - The root directory to search for directories.
     * @param  filters - {dir: string, file: string, ext: string}  Regular Expressions strings that match against direrctory path, filename, and file extension for selecting source files.   If multiple properties are specified, all properties must match for the file to pass the filter.
     * @param  mode - "int" or "str"  "int" returns the file size bytes in numbers, and "str" returns the file size bytes using metric prefixes (kB, MB, GB, etc.).  Default is "str".
     * @returns  A promise that resolves to an array of objects with directory path and size properties.
     */
    async dirSizes(rootDir, filters = {}, mode = "str") {
        const { data, err } = await getDirSizes(rootDir, filters, mode);
        if (err !== null)
            throw err;
        return data;
    }
    /**
     * Returns a list of duplicate files found under the root directory.
     * @param  rootDir - The root directory to search for duplicate files.
     * @param  filters - {dir: string, file: string, ext: string}  Regular Expressions strings that match against direrctory path, filename, and file extension for selecting source files.   If multiple properties are specified, all properties must match for the file to pass the filter.
     * @returns  A promise that resolves to an array of duplicate paths.  Each array element is an array of duplicate file paths.
     */
    async duplicateFiles(rootDir, filters = {}) {
        const { data, err } = await getDuplicates(rootDir, filters);
        if (err !== null)
            throw err;
        return data;
    }
}
export default DirlGet;
