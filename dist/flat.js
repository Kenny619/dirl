import { flattenAll, flattenUnique } from "./utils/baseFlatten.js";
export class DirlFlatten {
    /**
     * Copy files found under srcDir, flatten their directory structure and paste them to dstDir.  Subdirectory names are prepended to the file names with a separator.
     * @param  srcDir - The source directory.
     * @param  dstDir - The destination directory.
     * @param  separator - The separator for diving subdirectory names and file names.  Default is "_".
     * @param  filters - {dir: string, file: string, ext: string}  Regular Expressions strings that match against direrctory path, filename, and file extension for selecting source files.   If multiple properties are specified, all properties must match for the file to pass the filter.
     * @returns - A promise that resolves to copy operation results.  If copy was done successfully, src and dst path are stored in "succeeded" property.  If copy failed, failed src and dest path along with Error object are stored in the "failed" property.
     */
    async all(srcDir, dstDir, separator = "_", filters = {}) {
        const { result, err } = await flattenAll(srcDir, dstDir, separator, filters);
        if (err !== null)
            throw err;
        return result;
    }
    /**
     * Copy unique files found under srcDir, flatten their directory structure and paste them to dstDir.  Subdirectory names are prepended to the file names with a separator.
If duplicate files are found, only 1 file from the duplicate group is copied.
     * @param  srcDir - The source directory.
     * @param  dstDir - The destination directory.
     * @param  separator - The separator for diving subdirectory names and file names.  Default is "_".
     * @param  filters - {dir: string, file: string, ext: string}  Regular Expressions strings that match against direrctory path, filename, and file extension for selecting source files.   If multiple properties are specified, all properties must match for the file to pass the filter.
     * @returns - A promise that resolves to copy operation results.  If copy was done successfully, src and dst path are stored in "succeeded" property.  If copy failed, failed src and dest path along with Error object are stored in the "failed" property.
     */
    async unique(srcDir, dstDir, separator = "_", filters = {}) {
        const { result, err } = await flattenUnique(srcDir, dstDir, separator, filters);
        if (err !== null)
            throw err;
        return result;
    }
}
export default DirlFlatten;
