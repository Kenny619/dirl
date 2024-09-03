import fsp from "node:fs/promises";
import type { Dirent } from "node:fs";
import path from "node:path";
import process from "node:process";
import { ignoreFiles } from "./ignoreFIles.js";
import { applyFilter, createRegexFilters } from "./filter.js";
import { validateSrcDir } from "./validation.js";
import type { Filters, ReturnFormat } from "../types/type.js";
/**
 * note:1
 * In order to avoid the rejection of fsp.readdir promise when meeting a file/directory that is not accessible,
 * fsp.readdir with recursive:true option is not being used.
 * Instead, #readdirRecursion is being called recursively to read file entries underneath absPath directory.
 *
 * note:2
 * System files defined in ignoreFiles e.g. .DS_Store for MacOS and Thumbs.db and Desktop.ini for Windows
 * are excluded from the file count.
 * Those files are also being excluded from the target of copy/move/flatten operations.
 *
 */

export const getDirents = async (
	root: string,
	mode: "dir" | "file" | "all" = "all",
	filters?: Filters,
): Promise<ReturnFormat<Dirent[]>> => {
	//validate root path
	try {
		await validateSrcDir(root);
	} catch (e) {
		return { result: null, err: e as Error };
	}

	//convert root path to absolute path
	const absPath = path.resolve(process.cwd(), root);

	//subdirectories/files storage
	const dirents: Dirent[] = [];

	try {
		//read file entries underneath absPath directory recursively
		//save dirents to dirents array
		await readdirRecursion(absPath, mode, dirents);
	} catch (e) {
		return { result: null, err: e as Error };
	}

	//create regex filters
	const regexFilters = createRegexFilters(filters as Filters);

	//filter out dirents that don't match the regex filters.
	const result = regexFilters ? applyFilter(dirents, regexFilters) : dirents;

	return { result, err: null };
};

/**
 * Get a list of paths of file system entries under root directory, including the root directory itself.
 * @param root - The directory to get the paths from.
 * @param mode - "dir" for directory only.  "file" for file only. "all" for both file and directory.
 * @param filters - The filters to apply to the paths.  Only paths that match the filters are returned.
 * @returns Promise<ReturnFormat<string[]>> - Resolves with the array of paths.
 */
export const getPaths = async (
	root: string,
	mode: "dir" | "file" | "all" = "all",
	filters?: Filters,
): Promise<ReturnFormat<string[]>> => {
	//get dirents
	const { result: dirents, err } = await getDirents(root, mode, filters);
	if (err !== null) return { result: null, err };

	//create a collator for sorting
	const collator = new Intl.Collator(undefined, {
		numeric: true,
		sensitivity: "base",
	});
	//convert dirents to paths and sort the result alphabetically based on user's locale
	const result = dirents
		.map((dirent) => path.join(dirent.parentPath, dirent.name))
		.sort(collator.compare);

	return { result, err: null };
};

/**
 * Traverse a directory and its subdirectories and return a list of accessible items
 * @private - Used only by getSubDirs
 * @param root - The directory to traverse.
 * @param mode - "dir" for directory only.  "file" for file only. "all" for both file and directory.
 * @param dirents - The list of accessible items.
 */
const readdirRecursion = async (
	root: string,
	mode: "dir" | "file" | "all",
	dirents: Dirent[],
): Promise<void> => {
	const subDirs = await fsp.readdir(root, { withFileTypes: true });

	//if dirents is empty, add the dirent of root directory to dirents
	if (mode !== "file" && dirents.length === 0) {
		const parentPath = path.dirname(root);
		const pDirents = await fsp.readdir(parentPath, { withFileTypes: true });
		const rootDirent = pDirents.find(
			(dirent) => dirent.name === path.basename(root),
		);
		rootDirent && dirents.push(rootDirent);
	}

	try {
		await Promise.all(
			subDirs.map(async (sub: Dirent) => {
				try {
					const subPathName = path.join(sub.parentPath, sub.name);
					await fsp.access(subPathName, fsp.constants.R_OK);

					if (mode === "dir" && sub.isDirectory()) dirents.push(sub);
					if (mode === "file" && sub.isFile()) dirents.push(sub);
					if (mode === "all") dirents.push(sub);

					if (sub.isDirectory())
						await readdirRecursion(subPathName, mode, dirents);
				} catch (e) {
					return;
				}
			}),
		);
	} catch (e) {
		throw e as Error;
	}
};
/**
 * Checks for any files exising in a directory tree rooting from passed directory.  Returns true if the directory tree has no files.  Returns false if any of the directories contain files.
 * @param dir - The directory to check for emptiness.
 * @returns Promise<boolean> - Resolves with true if the directory and its subdirectories are empty, false otherwise.
 */
export const isDirTreeEmpty = async (root: string): Promise<boolean> => {
	try {
		const { result: dirs, err } = await getPaths(root, "dir");
		if (err !== null) throw err as Error;

		//return false (not empty) if any of the subdirectories contain files
		for (const dir of dirs) {
			if (!(await isDirEmpty(dir))) {
				return false;
			}
		}
	} catch (e) {
		throw e as Error;
	}

	return true;
};

/**
 * Return true if a given directory is empty.
 * @private - Used only by isDirTreeEmpty
 * @param dir - The directory to check for emptiness.
 * @returns Promise<boolean> - Resolves with true if the directory is empty, false otherwise.
 */
const isDirEmpty = async (root: string): Promise<boolean> => {
	try {
		const files = (await fsp.readdir(root, { withFileTypes: true })).filter(
			(d) => d.isFile() && !ignoreFiles.includes(d.name),
		);
		return files.length === 0;
	} catch (e) {
		throw e as Error;
	}
};
