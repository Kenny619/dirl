import fsp from "node:fs/promises";
import path from "node:path";
import {
	optionFilter,
	isFileMovable,
	isDstDirWritable,
	validateDirectoryPath,
	createRegexFilters,
} from "./utils/fileUtils.js";

/**
 * Moves files from a source directory to a destination directory based on specified options.
 *
 * @param {string} srcDir - The path to the source directory.
 * @param {string} dstDir - The path to the destination directory.
 * @param {options} option - An object containing options for filtering and mode of operation.
 * @param {string} [option.dirNameFilter] - A filter for directory names. Only directories matching this pattern will be considered.
 * @param {string} [option.fileNameFilter] - A filter for file names. Only files matching this pattern will be considered.
 * @param {string} [option.extNameFilter] - A filter for file extensions. Only files with these extensions will be considered.
 * @param {"copyOverwrite"|"copyDiff"|"copyIfNew"|"moveOverwrite"|"moveDiff"|"moveIfNew"} [option.mode] - The mode to handle file name collisions at the destination. Defaults to "copyDiff".
 *
 * @returns {Promise<boolean>} A promise that resolves to true if the operation is complete, or throws an error if the operation fails.
 *
 * @throws {Error} If the source directory is not valid or does not exist.
 * @throws {Error} If the destination directory cannot be created or accessed.
 * @throws {Error} If there are issues with file operations (e.g., copying, moving, or deleting files).
 *
 * @example
 * // Move all .txt files from 'src' to 'dest', overwriting existing files.
 * move('src', 'dest', { filterExt: '.txt', mode: 'moveOverwrite' });
 */
async function move(srcDir: string, dstDir: string, option: options) {
	//Validate srcDir
	try {
		await validateDirectoryPath(srcDir);
		if (srcDir === dstDir) throw new Error("srcDir and dstDir cannot be the same.");
	} catch (e) {
		throw new Error(`${srcDir} is not a valid directory.`);
	}

	//validate dstDir.
	try {
		await isDstDirWritable(dstDir);
	} catch (e) {
		throw new Error(`${e}`);
	}

	//default to "copyDiff" mode if option is not provided
	if (!Object.hasOwn(option, "mode")) option.mode = "copyDiff";

	//Get all filePaths under srcDir.  Apply option filter.
	let files: string[] = [];
	try {
		files = (await fsp.readdir(srcDir, { withFileTypes: true, recursive: true }))
			.filter((f) => !f.isDirectory())
			.map((f) => path.join(f.path, f.name));
	} catch (e) {
		throw new Error(`${(e as Error).name}.  ${(e as Error).message}}`);
	}

	//create Regexp filter
	const filters = createRegexFilters(option);
	if (filters) {
		//async filter condition -> create a promises of check result, await to resolve all, and use them as filter condition.
		try {
			const optionFilterResults = await Promise.all(files.map((f) => optionFilter(f, filters)));
			files = files.filter((_, i) => optionFilterResults[i]);
		} catch (e) {
			throw new Error(`${e}`);
		}
	}

	//Exit the program if no files to be copied/moved
	if (files.length === 0) {
		console.log(`COMPLETE:  no files found under ${srcDir}.  Moved 0 files`);
		return true;
	}

	console.log(`Identified ${files.length} files under ${srcDir}.  Start process '${option.mode}'...`);

	let successCnt = 0;

	//work from bottom to up the directory, allowing to delete empty dir in move* ops.
	files = files.reverse();
	for (const srcFilePath of files) {
		const dstPath = path.dirname(srcFilePath).replace(srcDir, dstDir);
		const dstFilePath = path.join(dstPath, path.basename(srcFilePath));

		//Skip copying/moving if file already exists in destination and cannot be copied/moved
		if (!(await isFileMovable(srcFilePath, dstFilePath, option.mode as mode))) continue;

		try {
			await fsp.mkdir(path.dirname(dstFilePath), { recursive: true });
			await fsp.copyFile(srcFilePath, dstFilePath);
			successCnt++;

			//file deletion for move* options
			if (option.mode === "moveDiff" || option.mode === "moveIfNew" || option.mode === "moveOverwrite") {
				try {
					await fsp.rm(srcFilePath, { maxRetries: 3, retryDelay: 1000 });
					const remainingFiles = await fsp.readdir(path.dirname(srcFilePath));
					if (remainingFiles.length === 0) await fsp.rmdir(path.dirname(srcFilePath));
				} catch (e) {
					console.error(`ERROR: Failed to delete file ${srcFilePath}: ${e}`);
				}
			}
		} catch (e) {
			//If midir, copyFile, unlink failes, console.error the message and continue the loop
			console.error(`${(e as Error).name}.  ${(e as Error).message} }`);
		}
	}
	console.log(`COMPLETE:  ${option.mode} completed for ${successCnt}/${files.length} files.`);
	return true;
}

export default move;
