import fsp from "node:fs/promises";
import path from "node:path";
import { isDstDirWritable, validateDirectoryPath, createRegexFilters } from "./utils/fileUtils.js";
import dirl from "./index.js";
export async function flatten(
	srcDir: string,
	dstDir: string,
	option: options = {
		separator: "_",
	},
): Promise<boolean> {
	//default separator to _.
	if (!Object.hasOwn(option, "separator")) {
		option.separator = "_";
	} else {
		//throw an error when  \, /, :, *, ?, ", <, >, | is used in separator
		const invalidChars = new RegExp(/[\\/:*?"<>|]/);
		if (invalidChars.test(option.separator as string)) {
			throw new Error(`Separator:${option.separator} cannot be used in filenames.`);
		}
	}

	//throw an error when dir path are invalid
	try {
		await validateDirectoryPath(srcDir);
		await isDstDirWritable(dstDir);
		const filesInSrc = await fsp.readdir(srcDir);
		if (filesInSrc.length === 0) {
			throw new Error(`No file found in ${srcDir}`);
		}
	} catch (e) {
		throw new Error(`Directory validtion failed.  ${e}`);
	}

	const filters = createRegexFilters(option);

	//listup file paths under srcDir
	let files: string[] = [];
	try {
		files = await dirl.getFilePaths(srcDir, option);
	} catch (e) {
		throw new Error(`getFilePaths failed.  ${e}`);
	}

	for (const file of files) {
		const dstFilePath = getDstFilePath(
			path.dirname(file),
			path.basename(file),
			option.separator as string,
			srcDir,
			dstDir,
		);

		try {
			await fsp.copyFile(file, dstFilePath);
		} catch (e) {
			throw new Error(`copyFile failed ${e}`);
		}
	}

	console.log("flatten complete");
	return true;
}

function getDstFilePath(dirName: string, fileName: string, separator: string, srcDir: string, dstDir: string): string {
	//delete common prefix=dirpath from dirName and replace / to separator
	let fNamePrefix = dirName.replace(srcDir, "");

	//convert \ to separator.  Delete the separator at the beginning.
	try {
		const regex = new RegExp(`^${separator}?`);
		fNamePrefix = fNamePrefix.split("\\").join(separator).replace(regex, "");
	} catch (e) {
		throw new Error(`RegExp failed to replace \ with ${separator}. ${e}`);
	}

	//if Total filename length exceeds 255 chars, shorten the filename.
	const flattenFileName = adjustFileNameLength(fNamePrefix, fileName, separator, dstDir);

	return path.join(dstDir, flattenFileName);
}

function adjustFileNameLength(prefix: string, fileName: string, separator: string, dstDir: string): string {
	//No adjustment are made if full filepath is < 255 chars.
	//Add separator between prefix and fileName only when prefix is not empty.
	if (dstDir.length + prefix.length + separator.length + fileName.length < 255) {
		return prefix.length > 0 ? `${prefix}${separator}${fileName}` : fileName;
	}

	const ttlLength = dstDir.length + prefix.length + fileName.length;
	const delCharCnt = ttlLength - 255 + 3; // +3 for replacing ... with deleted characters.

	const _prefix = prefix.length >= fileName.length ? `${prefix.slice(0, prefix.length - delCharCnt)}...` : prefix;

	const _fileName =
		fileName.length > prefix.length
			? `${path.basename(fileName, path.extname(fileName)).slice(0, fileName.length - delCharCnt)}....${path.extname(
					fileName,
				)}`
			: fileName;

	const _separator = separator.length > 0 ? separator : "";
	return `${_prefix}${_separator}${_fileName}`;
}

export default flatten;
