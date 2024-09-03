import { getFileSizes, getDirSizes, getDuplicates } from "./utils/baseGet.js";
import { getPaths } from "./utils/base.js";
import type { Filters } from "./types/type.js";
export class DirlGet {
	/**
	 * Returns a list of file paths under the root directory.
	 * @param  rootDir - The root directory to search for files.
	 * @param  filters - {dir: string, file: string, ext: string}  Regular Expressions strings that match against direrctory path, filename, and file extension for selecting source files.   If multiple properties are specified, all properties must match for the file to pass the filter.
	 * @returns  A promise that resolves to an array of file paths.
	 */
	public async filePaths(
		rootDir: string,
		filters: Filters = {},
	): Promise<string[]> {
		const { result, err } = await getPaths(rootDir, "file", filters);
		if (err !== null) throw err as Error;
		return result;
	}

	/**
	 * Returns a list of directory paths under the root directory.
	 * @param  rootDir - The root directory to search for directories.
	 * @param  filters - {dir: string, file: string, ext: string}  Regular Expressions strings that match against direrctory path, filename, and file extension for selecting source files.   If multiple properties are specified, all properties must match for the file to pass the filter.
	 * @returns  A promise that resolves to an array of directory paths.
	 */
	public async dirPaths(
		rootDir: string,
		filters: Filters = {},
	): Promise<string[]> {
		const { result, err } = await getPaths(rootDir, "dir", filters);
		if (err !== null) throw err as Error;
		return result;
	}

	/**
	 * Returns the number of files found under the root directory.
	 * @param  rootDir - The root directory to search for files.
	 * @param  filters - {dir: string, file: string, ext: string}  Regular Expressions strings that match against direrctory path, filename, and file extension for selecting source files.   If multiple properties are specified, all properties must match for the file to pass the filter.
	 * @returns  A promise that resolves to the number of files.
	 */
	public async fileCount(
		rootDir: string,
		filters: Filters = {},
	): Promise<number> {
		const { result, err } = await getPaths(rootDir, "file", filters);
		if (err !== null) throw err as Error;
		return result.length;
	}

	/**
	 * Returns the number of directories found under the root directory.
	 * @param  rootDir - The root directory to search for files.
	 * @param  filters - {dir: string, file: string, ext: string}  Regular Expressions strings that match against direrctory path, filename, and file extension for selecting source files.   If multiple properties are specified, all properties must match for the file to pass the filter.
	 * @returns  A promise that resolves to the number of directories.
	 */
	public async dirCount(
		rootDir: string,
		filters: Filters = {},
	): Promise<number> {
		const { result, err } = await getPaths(rootDir, "dir", filters);
		if (err !== null) throw err as Error;
		return result.length;
	}
	/**
	 * Returns a list of file sizes under the root directory.
	 * @param  rootDir - The root directory to search for files.
	 * @param  filters - {dir: string, file: string, ext: string}  Regular Expressions strings that match against direrctory path, filename, and file extension for selecting source files.   If multiple properties are specified, all properties must match for the file to pass the filter.
	 * @param  mode - "int" or "str"  "int" returns the file size bytes in numbers, and "str" returns the file size bytes using metric prefixes (kB, MB, GB, etc.).  Default is "str".
	 * @returns  A promise that resolves to an array of objects with file path and size properties.
	 */
	public async fileSizes(
		rootDir: string,
		filters: Filters = {},
		mode: "int" | "str" = "str",
	): Promise<{ path: string; size: string | number }[]> {
		const { result, err } = await getFileSizes(rootDir, filters, mode);
		if (err !== null) throw err as Error;
		return result;
	}

	/**
	 * Returns a list of directory sizes under the root directory.  Each directory size include the size of all files and subdirectories under that directory.
	 * @param  rootDir - The root directory to search for directories.
	 * @param  filters - {dir: string, file: string, ext: string}  Regular Expressions strings that match against direrctory path, filename, and file extension for selecting source files.   If multiple properties are specified, all properties must match for the file to pass the filter.
	 * @param  mode - "int" or "str"  "int" returns the file size bytes in numbers, and "str" returns the file size bytes using metric prefixes (kB, MB, GB, etc.).  Default is "str".
	 * @returns  A promise that resolves to an array of objects with directory path and size properties.
	 */
	public async dirSizes(
		rootDir: string,
		filters: Filters = {},
		mode: "int" | "str" = "str",
	): Promise<{ path: string; size: string | number }[]> {
		const { result, err } = await getDirSizes(rootDir, filters, mode);
		if (err !== null) throw err as Error;
		return result;
	}

	/**
	 * Returns a list of duplicate files found under the root directory.
	 * @param  rootDir - The root directory to search for duplicate files.
	 * @param  filters - {dir: string, file: string, ext: string}  Regular Expressions strings that match against direrctory path, filename, and file extension for selecting source files.   If multiple properties are specified, all properties must match for the file to pass the filter.
	 * @returns  A promise that resolves to an array of duplicate paths.  Each array element is an array of duplicate file paths.
	 */
	public async duplicateFiles(
		rootDir: string,
		filters: Filters = {},
	): Promise<string[][]> {
		const { result, err } = await getDuplicates(rootDir, filters);
		if (err !== null) throw err as Error;
		return result;
	}
}
export default DirlGet;
