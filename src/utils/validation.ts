import fsp from "node:fs/promises";
/**
 * Validates given path is an accessible directory.  If a given path is valid, the promise fulfills with no value.  Otherwise the promise rejects with an error.
 * @param dir - The directory path to validate.
 * @returns Promise<void> - Resolves when the directory path is valid.
 */
export const validateSrcDir = async (srcDir: string): Promise<void> => {
	try {
		const stat = await fsp.stat(srcDir);
		if (!stat.isDirectory())
			throw new Error(
				`${srcDir} is not a directory.  Please provide a directory path.`,
			);
		if (stat.isDirectory()) await fsp.access(srcDir, fsp.constants.R_OK);
	} catch (e) {
		throw e as Error;
	}
};

/**
 * Validates destination directory that it's a valid directory and writable.  If the path is valid promise fullfills with no value.  Otherwise the promise rejects with an error.
 * @param dstDir - The destination directory.
 * @returns Promise<boolean> - Resolves when the destination directory is valid.
 */
export const validateDstDir = async (dstDir: string): Promise<boolean> => {
	try {
		//create a directory if dstPath doesn't exist
		await fsp.mkdir(dstDir, { recursive: true });
	} catch (e) {
		throw e as Error;
	}

	//create a tmp test file to check if dstDir is writable
	const tempFilePath = `${dstDir}/.isDstDirWritable__test`;
	try {
		// Check if the directory is writable by trying to write a temporary file
		const file = await fsp.writeFile(tempFilePath, "");
	} catch (e) {
		throw e as Error;
	}

	try {
		//delete the tmp test file
		await fsp.rm(tempFilePath);
	} catch (e) {
		//ignore error if fs couldn't locate the file.  throw error only when the error is other than ENOENT.
		if (!/ENOENT|EPERM/.test((e as Error).message))
			throw new Error(
				`Failed to unlink test file in ${dstDir} ${(e as Error).message} ${(e as Error).stack}`,
			);
	}
	return true;
};

/**
 * Validates source and destination directories that they are valid, readable, and writable.  If the path is valid promise fullfills with no value.  Otherwise the promise rejects with an error.
 * @param srcDir - The source directory.
 * @param dstDir - The destination directory.
 * @returns Promise<void> - Resolves when the source and destination directories are valid.
 */
export const validatetDirs = async (
	srcDir: string,
	dstDir: string,
): Promise<void> => {
	if (srcDir === dstDir)
		throw new Error(
			"source directory and destination directory cannot be the same.",
		);

	try {
		await validateSrcDir(srcDir);
	} catch (e) {
		throw e as Error;
	}

	try {
		await validateDstDir(dstDir);
	} catch (e) {
		throw e as Error;
	}
};
