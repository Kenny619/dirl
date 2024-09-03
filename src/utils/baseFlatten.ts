import fsp from "node:fs/promises";
import path from "node:path";
import { getPaths } from "./base.js";
import { validatetDirs } from "./validation.js";
import { getDuplicates } from "./baseGet.js";
import type { Filters, ReturnFormat, MoveResults } from "../types/type.js";
export const flattenAll = async (
	srcDir: string,
	dstDir: string,
	separator = "_",
	filters: Filters = {},
): Promise<ReturnFormat<MoveResults>> => {
	try {
		//validate source and destination dir
		await validatetDirs(srcDir, dstDir);
	} catch (e) {
		return { result: null, err: e as Error };
	}

	try {
		//validate separator
		valSeparator(separator);

		//get file paths residing under srcDir
		const { result: files, err } = await getPaths(srcDir, "file", filters);
		if (err) return { result: null, err: err as Error };

		//return format
		const result: MoveResults = { succeeded: [], failed: [] };

		//return if no files are found under srcDir
		if (files.length === 0) return { result, err: null };

		//convert dstDir into an absolute path to align the format with srcDir
		const absDstDir = path.resolve(dstDir);

		//get filename to be used in the destination dir
		for (const srcFilePath of files) {
			const dstFilePath = flattenFilePath(
				srcFilePath,
				separator,
				srcDir,
				absDstDir,
			);
			try {
				await fsp.copyFile(srcFilePath, dstFilePath);
				result.succeeded.push({ srcFilePath, dstFilePath });
			} catch (e) {
				result.failed.push({ srcFilePath, dstFilePath, err: e as Error });
			}
		}

		return { result, err: null };
	} catch (e) {
		return { result: null, err: e as Error };
	}
};

export const flattenUnique = async (
	srcDir: string,
	dstDir: string,
	separator = "_",
	filters: Filters = {},
): Promise<ReturnFormat<MoveResults>> => {
	try {
		//validate source and destination dir
		await validatetDirs(srcDir, dstDir);
	} catch (e) {
		return { result: null, err: e as Error };
	}

	//validate separator
	valSeparator(separator);

	//get file paths under srcDir
	const { result: files, err: e } = await getPaths(srcDir, "file", filters);
	if (e) return { result: null, err: e as Error };

	const result: MoveResults = { succeeded: [], failed: [] };

	//return if no files are found under srcDir
	if (files.length === 0) return { result, err: null };

	//get duplicate file paths under srcDir
	const { result: duplicates, err } = await getDuplicates(srcDir, filters);
	if (err) return { result: null, err: err as Error };

	//create an array of duplicate files to be excluded from the output
	//Take out 1 file from each duplicate group so that 1 file from duplicate group will
	//remain in the output

	let uniqueFiles = files;
	if (duplicates.length > 0) {
		const excludeFileListAry = duplicates.map((files: string[]) => files.pop());
		const excludeFileList = excludeFileListAry.flat();
		uniqueFiles = files.filter(
			(file: string) => !excludeFileList.includes(file),
		);
	}

	//convert dstDir into an absolute path to align the format with srcDir
	const absDstDir = path.resolve(dstDir);

	try {
		for (const srcFilePath of uniqueFiles) {
			const dstFilePath = flattenFilePath(
				srcFilePath,
				separator,
				srcDir,
				absDstDir,
			);
			try {
				await fsp.copyFile(srcFilePath, dstFilePath);
				result.succeeded.push({ srcFilePath, dstFilePath });
			} catch (e) {
				result.failed.push({ srcFilePath, dstFilePath, err: e as Error });
			}
		}
		return { result, err: null };
	} catch (e) {
		return { result: null, err: e as Error };
	}
};

export const valSeparator = (separator: string): void => {
	if (separator !== "_") {
		//throw an error when  \, /, :, *, ?, ", <, >, | is used in separator
		const invalidChars = new RegExp(/[\\/:*?"<>|]/);
		if (invalidChars.test(separator))
			throw new Error(`Separator:${separator} cannot be used in filenames.`);
	}
};

export const flattenFilePath = (
	filePath: string,
	separator: string,
	srcDir: string,
	dstDir: string,
): string => {
	//get path separator
	const curSeparator = process.platform === "win32" ? "\\" : "/";

	//get the absolute path of srcDir
	const absSrcDir = path.resolve(srcDir);

	//get the relative path of filePath from srcDir
	const srcDirPath = path.dirname(filePath).replace(absSrcDir, "");

	//get the base file name of filePath
	const dstBaseName = path.basename(filePath);

	// delete the separator at the beginning of srcDirPath
	// then replace all the default path separators with passed separator
	let dstFileNamePrefix = srcDirPath
		.slice(1)
		.split(curSeparator)
		.join(separator);

	//if the length of filename exceeds 255 chars, shorten the filename.
	if (path.join(dstDir, dstFileNamePrefix, dstBaseName).length > 255) {
		//calculate the total length of the filepath
		const ttlLength = path.join(dstDir, dstFileNamePrefix, dstBaseName).length;
		const delCharCnt = ttlLength - 255 + 3; // +3 for replacing ... with deleted characters.
		dstFileNamePrefix = `${dstFileNamePrefix.slice(0, dstFileNamePrefix.length - delCharCnt)}...`;
	}

	//concatenate dstFileNamePrefix and dstBaseName with separator
	const dstFileName =
		dstFileNamePrefix.length > 0
			? `${dstFileNamePrefix}${separator}${dstBaseName}`
			: dstBaseName;
	return path.join(dstDir, dstFileName);
};
