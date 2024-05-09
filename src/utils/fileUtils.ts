import fsp from "node:fs/promises";
import path from "node:path";

/**
 * Validates whether the given file path corresponds to a directory.
 * @param {string} dirPath - The path to be validated.
 * @returns {Promise<boolean>} - Returns true if the path corresponds to a directory, otherwise false.
 * @throws {Error} - Throws an error if filePath is not a valid path or if the directory validation fails.
 */
export async function validateDirectoryPath(dirPath: string): Promise<boolean> {
	try {
		const stat = await fsp.stat(dirPath);
		if (!stat.isDirectory()) throw new Error(`${dirPath} is not a valid directory.`);
		return true;
	} catch (e) {
		throw new Error(`validateDirectoryPath failed.  ${dirPath} is not a valid directory.  ${e}`);
	}
}

/**
 * Validates if the given file path points to a file.
 * @param {string} filePath - The path to validate.
 * @returns {Promise<boolean>} - Returns true if the path is a file, false otherwise.
 * @throws {Error} - Throws an error if the path is not valid or not a file.
 */
export async function validateFilePath(filePath: string): Promise<boolean> {
	try {
		const stat = await fsp.stat(filePath);
		if (!stat.isFile()) throw new Error(`${filePath} is not a valid file.`);
		return true;
	} catch (e) {
		throw new Error(`validateFilePath failed.  ${filePath} is not a valid file path.  ${e}`);
	}
}

/**
 * Creates regex filters based on the provided options.
 * @param {option} option - The options object containing regex patterns for filtering.
 * @param {string} option.dirNameFilter - Filter word or RegExp for directory path.
 * @param {string} option.fileNameFilter - Filter word or RegExp for file name.
 * @param {string} option.extNameFilter - Filter word or RegExp for file extention name.
 * @returns {regexFilters} - An object containing compiled regex filters.
 * @throws {Error} - Throws an error if any of the regex patterns are invalid.
 */
export function createRegexFilters(option: options): regexFilters {
	const validatedRegex: regexFilters = {};
	for (const key in option) {
		if (key === "dirNameFilter" || key === "fileNameFilter" || key === "extNameFilter") {
			try {
				validatedRegex[key as keyof regexFilters] = new RegExp(option[key as keyof regexFilters] as string);
			} catch (e) {
				throw new Error(
					`createRegexFilters failed.  ${option[key as keyof options]} is not a valid RegExp.  ${e as Error}`,
				);
			}
		}
	}
	return validatedRegex;
}

/**
 * Filters a file path based on the provided regex filters.
 * @param {string} filePath - The file path to filter.
 * @param {regexFilters} filters - The regex filters to apply.
 * @param {RegExp} filters.dirNameFilter - Filter for directory path.
 * @param {RegExp} filters.fileNameFilter - Filter for file name.
 * @param {RegExp} filters.extNameFilter - Filter for file extention.
 * @returns {Promise<boolean>} - Returns true if the file path passes all filters, false otherwise.
 * @throws {Error} - Throws an error if the file path is not valid.
 */
export async function optionFilter(filePath: string, filters: regexFilters): Promise<boolean> {
	//validate filePath
	try {
		await validateFilePath(filePath);
	} catch (e) {
		throw new Error(`optionFilter failed.  ${filePath} is not a valid file path.  ${e}`);
	}

	//exit with true if threre's no filter in option
	if (Object.keys(filters).length === 0) return true;

	//provide same property name for each path as the 'filters' object
	const testPath: { [Key in FilterNames]: string } = {
		dirNameFilter: path.dirname(filePath),
		fileNameFilter: path.basename(filePath, path.extname(filePath)), //exclude file extention from test
		extNameFilter: path.extname(filePath),
	};

	//test each filter properties exist in filters.  If any of the filter fails, return false
	for (const key in filters) {
		if (!(filters[key as keyof typeof filters] as RegExp).test(testPath[key as keyof typeof testPath])) {
			return false;
		}
	}

	//If all filters passed the test, return true
	return true;
}

/**
 * Checks if a file can be moved or copied to a new location based on the specified mode.
 * @param {string} srcFilePath - The source file path.
 * @param {string} dstFilePath - The destination file path.
 * @param {mode} mode - The mode of operation (copyOverwrite, moveOverwrite, copyIfNew, moveIfNew, copyDiff, moveDiff).
 * @returns {Promise<boolean>} - Returns true if the operation can proceed, false otherwise.
 * @throws {Error} - Throws an error if the source and destination paths are the same, or if there are issues with the file paths.
 */
export async function isFileMovable(srcFilePath: string, dstFilePath: string, mode: mode): Promise<boolean> {
	//throw error if source and destination are pointing to the same file
	if (srcFilePath === dstFilePath) {
		throw new Error(
			`srcFilePath and dstFilePath cannot be the same file.\r\nsrcFilePath: ${srcFilePath}\r\ndstFilePath: ${dstFilePath}`,
		);
	}

	//validate directory paths
	try {
		await validateFilePath(srcFilePath);
		await isDstDirWritable(path.dirname(dstFilePath));
	} catch (e) {
		throw new Error(`${e}`);
	}

	//No further checks for *Overwrite
	if (mode === "copyOverwrite" || mode === "moveOverwrite") return true;

	//check if a file already exist in dstFilePath
	try {
		const dstFile = await fsp.stat(dstFilePath);

		//For mode===copyIfNew/moveIfNew.  check the last modified date.  Return true if src file is newer than dst
		if (mode === "copyIfNew" || mode === "moveIfNew") {
			const srcFile = await fsp.stat(srcFilePath);
			return srcFile.mtime > dstFile.mtime;
		}

		//For mode === copyDiff/moveDiff.  Return false if a file already exists in dstFilePath
		if (dstFile.isFile()) {
			return false;
		}

		//If its not a file, then return true.
		return true;
	} catch (_) {
		//There is no file on dstFilePath.  Return true and perform copy/move operation
		return true;
	}
}

/**
 * Checks if a destination directory is writable.
 * @param {string} dstPath - The destination directory path.
 * @returns {Promise<boolean>} - Returns true if the directory is writable, false otherwise.
 * @throws {Error} - Throws an error if the directory cannot be created or is not writable.
 */

export async function isDstDirWritable(dstPath: string): Promise<boolean> {
	try {
		// Attempt to create the directory if it doesn't exist
		await fsp.mkdir(dstPath, { recursive: true });

		// Check if the directory is writable by trying to write a temporary file
		const tempFilePath = `${dstPath}/.isDstDirWritable__test`;
		await fsp.writeFile(tempFilePath, "");
		await fsp.unlink(tempFilePath); // Clean up the temporary file

		return true;
	} catch (e) {
		throw new Error(`Failed to write to directory ${dstPath}: ${e}`);
	}
}
