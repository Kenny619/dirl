import { transferFiles } from "./utils/baseTransfer.js";
import type { Filters, MoveResults } from "./types/type.js";
export class DirlCopy {
	/**
	 * Copies files from srcDir to dstDir, overwriting files in dstDir if they exist.
	 * @param  srcDir - The source directory.
	 * @param  dstDir - The destination directory.
	 * @param  filters - {dir: string, file: string, ext: string}  Regular Expressions strings that match against direrctory path, filename, and file extension for selecting source files.   If multiple properties are specified, all properties must match for the file to pass the filter.
	 * @returns - A promise that resolves to copy operation results.  If copy was done successfully, src and dst path are stored in "succeeded" property.  If copy failed, failed src and dest path along with Error object are stored in the "failed" property.
	 */
	async overwrite(
		srcDir: string,
		dstDir: string,
		filters: Filters = {},
	): Promise<MoveResults> {
		const { result, err } = await transferFiles(
			srcDir,
			dstDir,
			"copyOverwrite",
			filters,
		);
		if (err !== null) throw err as Error;
		return result;
	}

	/**
	 * Copies files from srcDir to dstDir only if the source files don't exist in destination directory.
	 * @param srcDir - The source directory.
	 * @param dstDir - The destination directory.
	 * @param  filters - {dir: string, file: string, ext: string}  Regular Expressions strings that match against direrctory path, filename, and file extension for selecting source files.   If multiple properties are specified, all properties must match for the file to pass the filter.
	 * @returns - A promise that resolves to copy operation results.  If copy was done successfully, src and dst path are stored in "succeeded" property.  If copy failed, failed src and dest path along with Error object are stored in the "failed" property.
	 */
	async diff(
		srcDir: string,
		dstDir: string,
		filters: Filters = {},
	): Promise<MoveResults> {
		const { result, err } = await transferFiles(
			srcDir,
			dstDir,
			"copyDiff",
			filters,
		);
		if (err !== null) throw err as Error;
		return result;
	}

	/**
	 * Copies files from srcDir to dstDir.  If files exist in dstDir, they are overwritten only when the source file is newer than the destination file.
	 * @param srcDir - The source directory.
	 * @param dstDir - The destination directory.
	 * @param  filters - {dir: string, file: string, ext: string}  Regular Expressions strings that match against direrctory path, filename, and file extension for selecting source files.   If multiple properties are specified, all properties must match for the file to pass the filter.
	 * @returns - A promise that resolves to copy operation results.  If copy was done successfully, src and dst path are stored in "succeeded" property.  If copy failed, failed src and dest path along with Error object are stored in the "failed" property.
	 */
	async ifNew(
		srcDir: string,
		dstDir: string,
		filters: Filters = {},
	): Promise<MoveResults> {
		const { result, err } = await transferFiles(
			srcDir,
			dstDir,
			"copyIfNew",
			filters,
		);
		if (err !== null) throw err as Error;
		return result;
	}
}
export default DirlCopy;
