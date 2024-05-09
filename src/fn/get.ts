import fsp from "node:fs/promises";
import path from "node:path";
import * as fUtil from "./utils/fileUtils.js";

/**
 * Retrieves a list of file paths under a specified root directory, optionally applying filters on directory name, file name, and extension.
 * @param {string} root - The root directory path to search for files.
 * @param {options} [option={}] - An optional object containing regex patterns for filtering directory name, file name, and extension.
 * @param {string} [option.dirNameFilter] - A filter for directory names. Only directories matching this pattern will be considered.
 * @param {string} [option.fileNameFilter] - A filter for file names. Only files matching this pattern will be considered.
 * @param {string} [option.extNameFilter] - A filter for file extensions. Only files with these extensions will be considered.
 * @returns {Promise<string[]>} - A promise that resolves to an array of file paths that match the filters.
 * @throws {Error} - Throws an error if the root directory is not valid or if there's an issue reading the directory.
 */
async function getFilePaths(root: string, option: options = {}): Promise<string[]> {
	//root directory validation
	try {
		await fUtil.validateDirectoryPath(root);
	} catch (e) {
		throw new Error(`${root} is not a valid directory.  ${e}`);
	}

	let files = [];
	try {
		files = (await fsp.readdir(root, { withFileTypes: true, recursive: true }))
			.filter((f) => !f.isDirectory())
			.map((f) => path.join(f.path, f.name));
	} catch (e) {
		throw new Error(`${e}`);
	}

	const filters = fUtil.createRegexFilters(option);

	if (filters) {
		const filterResults = await Promise.all(files.map((file) => fUtil.optionFilter(file, filters)));
		return files.filter((_, i) => filterResults[i]);
	}

	return files;
}

/**
 * Retrieves the number of files under a specified root directory, optionally applying filters on directory name, file name, and extension.
 * @param {string} root - The root directory path to count files in.
 * @param {options} [option={}] - An optional object containing regex patterns for filtering directory name, file name, and extension.
 * @param {string} [option.dirNameFilter] - A filter for directory names. Only directories matching this pattern will be considered.
 * @param {string} [option.fileNameFilter] - A filter for file names. Only files matching this pattern will be considered.
 * @param {string} [option.extNameFilter] - A filter for file extensions. Only files with these extensions will be considered.
 * @returns {Promise<number>} - A promise that resolves to the number of files that match the filters.
 * @throws {Error} - Throws an error if there's an issue retrieving the file paths or if the root directory is not valid.
 */
async function getFileCount(root: string, option: options = {}): Promise<number> {
	try {
		const filesPaths = await getFilePaths(root, option);
		return filesPaths.length;
	} catch (e) {
		throw new Error(`${e}`);
	}
}

export { getFileCount, getFilePaths };
