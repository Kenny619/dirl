import path from "node:path";
import type { Dirent } from "node:fs";
import { ignoreFiles } from "./ignoreFIles.js";
import type { Filters, RegexFilters } from "../types/type.js";

/**
 * Apply regex filters to a list of dirents.
 * @private - Used only by getDirents
 * @param dirents - The list of dirents to apply the filters to.
 * @param regexFilters - The regex filters to apply.
 * @returns The filtered list of dirents.
 */
export const applyFilter = (dirents: Dirent[], regexFilters: RegexFilters) => {
	//match dirent against filters
	return dirents.filter((dirent) => {
		if (dirent.isDirectory() && regexFilters.dir !== undefined) {
			return regexFilters.dir.test(path.join(dirent.parentPath, dirent.name));
		}

		if (dirent.isFile()) {
			if (ignoreFiles.includes(dirent.name)) return false;

			if (regexFilters.dir && !regexFilters.dir.test(dirent.parentPath))
				return false;
			if (regexFilters.file && !regexFilters.file.test(dirent.name))
				return false;
			if (regexFilters.ext && !regexFilters.ext.test(path.extname(dirent.name)))
				return false;

			return true;
		}
	});
};

/**
 * Converts filter strings to RegExp objects, {dir: RegExp, file: RegExp, ext: RegExp}.  Properties other than dir, file, ext are ignored.  Throws an error if the filter is not a valid RegExp.
 * @param filters - The filter object to create a regex filter from.
 * @returns The regex filter.
 */
export const createRegexFilters = (filters: Filters): RegexFilters | null => {
	//return null if filter was null
	if (filters === null) return null;

	//return null if filters is not an object
	if (typeof filters !== "object" || Array.isArray(filters)) return null;

	//return null if filter properties are missing
	if (!filters.dir && !filters.file && !filters.ext) return null;

	return Object.keys(filters).reduce((acc: RegexFilters, key) => {
		if (!["dir", "file", "ext"].includes(key)) return acc;
		try {
			acc[key as keyof RegexFilters] = new RegExp(
				filters[key as keyof Filters] as string,
			);
		} catch (e) {
			throw e as Error;
		}
		return acc;
	}, {});
};
