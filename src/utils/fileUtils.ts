import fsp from "node:fs/promises";
import path from "node:path";
/**
 * type for 'option' argument after filters are converted from string to RegExp.
 */
//
export async function validateDirectoryPath(filePath: string) {
	try {
		const stat = await fsp.stat(filePath);
		if (!stat.isDirectory()) throw new Error(`${filePath} is not a valid file.`);
		return true;
	} catch (e) {
		throw new Error(`Directory path validation failed.  ${e}`);
	}
}

export async function validateFilePath(filePath: string) {
	try {
		const stat = await fsp.stat(filePath);
		if (!stat.isFile()) throw new Error(`${filePath} is not a valid file.`);
		return true;
	} catch (e) {
		throw new Error(`File path validation failed.  ${e}`);
	}
}

export function createRegexFilters(option: options): regexFilters {
	const validatedRegex: regexFilters = {};
	for (const key in option) {
		if (key === "dirNameFilter" || key === "fileNameFilter" || key === "extNameFilter") {
			try {
				validatedRegex[key as keyof regexFilters] = new RegExp(option[key as keyof regexFilters] as string);
			} catch (e) {
				throw new Error(`${option[key as keyof options]} is not a valid RegExp.  ${e as Error}`);
			}
		}
	}
	return validatedRegex;
}
/**
 * Filter out files that do not match option.*Filter RegExp
 */
export async function optionFilter(filePath: string, filters: regexFilters) {
	//validate filePath
	try {
		await validateFilePath(filePath);
	} catch (e) {
		throw new Error(`File path is not valid.  path:${filePath}  Error:${e}`);
	}

	//exit with true if threre's no filter in option
	//if (Object.keys(option).length === 1) return true;

	const testPath: { [Key in FilterNames]: string } = {
		dirNameFilter: path.dirname(filePath),
		fileNameFilter: path.basename(filePath, path.extname(filePath)),
		extNameFilter: path.extname(filePath),
	};

	for (const key in filters) {
		if (!(filters[key as keyof typeof filters] as RegExp).test(testPath[key as keyof typeof testPath])) {
			return false;
		}
	}
	return true;
}

/**
 * Checks if copy/move operation can be performed on the file
 */
export async function isFileMovable(srcFilePath: string, dstFilePath: string, mode: mode) {
	if (srcFilePath === dstFilePath) {
		throw new Error(
			`srcFilePath and dstFilePath cannot be the same file.\r\nsrcFilePath: ${srcFilePath}\r\ndstFilePath: ${dstFilePath}`,
		);
	}
	//same file path
	//validate file path
	try {
		await validateFilePath(srcFilePath);
		await isDstDirWritable(path.dirname(dstFilePath));
	} catch (e) {
		throw new Error(`${e}`);
	}

	if (mode === "copyOverwrite" || mode === "moveOverwrite") return true;

	//check if a file already exist in dstFilePath
	try {
		const dstFile = await fsp.stat(dstFilePath);

		///check the last modified date.  Return true if src file is newer.
		if (mode === "copyIfNew" || mode === "moveIfNew") {
			const srcFile = await fsp.stat(srcFilePath);
			return srcFile.mtime > dstFile.mtime;
		}

		//mode === copyDiff | moveDiff.  Return false and skip copy/move since file exists in dst
		return false;
	} catch (_) {
		//There is no file on dstFilePath.  Return true and perform copy/move operation
		return true;
	}
}

/**
 * resolves when passed destination directory exists and is writable
 * SIDE EFFECT: if destination directory doesn't exit, it'll be created
 * rejects if destination can't be created or is not writable
 */
export async function isDstDirWritable(dstPath: string) {
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
