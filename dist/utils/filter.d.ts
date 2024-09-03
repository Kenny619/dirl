import type { Dirent } from "node:fs";
import type { Filters, RegexFilters } from "../types/type.js";
/**
 * Apply regex filters to a list of dirents.
 * @private - Used only by getDirents
 * @param dirents - The list of dirents to apply the filters to.
 * @param regexFilters - The regex filters to apply.
 * @returns The filtered list of dirents.
 */
export declare const applyFilter: (dirents: Dirent[], regexFilters: RegexFilters) => Dirent[];
/**
 * Converts filter strings to RegExp objects, {dir: RegExp, file: RegExp, ext: RegExp}.  Properties other than dir, file, ext are ignored.  Throws an error if the filter is not a valid RegExp.
 * @param filters - The filter object to create a regex filter from.
 * @returns The regex filter.
 */
export declare const createRegexFilters: (filters: Filters) => RegexFilters | null;
