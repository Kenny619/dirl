import { transferFiles } from "./utils/baseTransfer.js";
export class DirlMove {
    /**
     * Moves files from srcDir to dstDir, overwriting files in dstDir if they exist.
     * @param  srcDir - The source directory.
     * @param  dstDir - The destination directory.
     * @param  filters - {dir: string, file: string, ext: string}  Regular Expressions strings that match against direrctory path, filename, and file extension for selecting source files.   If multiple properties are specified, all properties must match for the file to pass the filter.
     * @returns - A promise that resolves to copy operation results.  If copy was done successfully, src and dst path are stored in "succeeded" property.  If copy failed, failed src and dest path along with Error object are stored in the "failed" property.
     */
    async overwrite(srcDir, dstDir, filters = {}) {
        const { result, err } = await transferFiles(srcDir, dstDir, "moveOverwrite", filters);
        if (err !== null)
            throw err;
        return result;
    }
    /**
     * Moves files from srcDir to dstDir only if the source file doesn't exist in destination directory.
     * @param srcDir - The source directory.
     * @param dstDir - The destination directory.
     * @param  filters - {dir: string, file: string, ext: string}  Regular Expressions strings that match against direrctory path, filename, and file extension for selecting source files.   If multiple properties are specified, all properties must match for the file to pass the filter.
     * @returns - A promise that resolves to copy operation results.  If copy was done successfully, src and dst path are stored in "succeeded" property.  If copy failed, failed src and dest path along with Error object are stored in the "failed" property.
     */
    async diff(srcDir, dstDir, filters = {}) {
        const { result, err } = await transferFiles(srcDir, dstDir, "moveDiff", filters);
        if (err !== null)
            throw err;
        return result;
    }
    /**
     * Moves files from srcDir to dstDir.  If files exist in dstDir, they are overwritten only when the source file is newer than the destination file.
     * @param srcDir - The source directory.
     * @param dstDir - The destination directory.
     * @param  filters - {dir: string, file: string, ext: string}  Regular Expressions strings that match against direrctory path, filename, and file extension for selecting source files.   If multiple properties are specified, all properties must match for the file to pass the filter.
     * @returns - A promise that resolves to copy operation results.  If copy was done successfully, src and dst path are stored in "succeeded" property.  If copy failed, failed src and dest path along with Error object are stored in the "failed" property.
     */
    async ifNew(srcDir, dstDir, filters = {}) {
        const { result, err } = await transferFiles(srcDir, dstDir, "moveIfNew", filters);
        if (err !== null)
            throw err;
        return result;
    }
}
export default DirlMove;
