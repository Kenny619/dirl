import fsp from "node:fs/promises";
import path from "node:path";
import dirLGet from "./get.js";
import { g } from "vitest/dist/suite-IbNSsUWN.js";

class DirlFlatten extends dirLGet {
	public flatten: Flatten;
	constructor() {
		super();
		this.flatten = {
			all: async (srcDir: string, dstDir: string, separator = "_", filters: Filters = {}): Promise<void> => {
				try {
					await this.flattenDir(srcDir, dstDir, separator, filters);
				} catch (e) {
					throw new Error(`${e}`);
				}
			},

			unique: async (srcDir: string, dstDir: string, separator = "_", filters: Filters = {}): Promise<void> => {
				try {
					await this.flattenUnique(srcDir, dstDir, separator, filters);
				} catch (e) {
					throw new Error(`${e}`);
				}
			},
		};
	}

	async flattenDir(srcDir: string, dstDir: string, separator = "_", filters: Filters = {}): Promise<void> {
		//validate srcDir, dstDir, and separator.  Get file paths from srcDir
		const files = await this.getSrcFileList(srcDir, dstDir, separator, filters);

		//create destination file path
		const copyFiles = files.map((file) => {
			const dstFilePath = this.flattenFilePath(path.dirname(file), path.basename(file), separator, srcDir, dstDir);
			return fsp.copyFile(file, dstFilePath);
		});

		//copy files
		try {
			await Promise.all(copyFiles.map((file) => file));
		} catch (e) {
			throw new Error(`copyFile failed in flattenDir.  ${e}`);
		}
	}

	async flattenUnique(srcDir: string, dstDir: string, separator = "_", filters: Filters = {}): Promise<void> {
		//validate srcDir, dstDir, and separator.  Get file paths from srcDir
		let srcFilePaths: string[] = [];
		try {
			srcFilePaths = await this.getSrcFileList(srcDir, dstDir, separator, filters);
		} catch (e) {
			throw new Error(`getSrcFileList failed in flattenUnique.  ${e}`);
		}

		let groups: FileSizeGroup = [];
		try {
			groups = await super.groupFilesBySize(srcFilePaths);
		} catch (e) {
			throw new Error(`groupFilesBySize failed.  ${e}`);
		}

		let duplicates: Duplicates = [];
		try {
			duplicates = await super.findDuplicatesFromSizeGroup(groups);
		} catch (e) {
			throw new Error(`groupFilesBySize or findDuplicatesFromSizeGroup failed.  ${e}`);
		}

		const duplicatesToBeOmitted: string[] = [];
		for (const group of duplicates) {
			group.shift();
			duplicatesToBeOmitted.push(...group);
		}

		//create destination file path
		const copyFilesPromise = srcFilePaths
			.filter((file) => !duplicatesToBeOmitted.includes(file))
			.map((file) => {
				const dstFilePath = this.flattenFilePath(path.dirname(file), path.basename(file), separator, srcDir, dstDir);
				return fsp.copyFile(file, dstFilePath);
			});

		//copy files
		try {
			await Promise.all(copyFilesPromise);
		} catch (e) {
			throw new Error(`copyFile failed in flattenDir.  ${e}`);
		}
	}
	async getSrcFileList(srcDir: string, dstDir: string, separator = "_", filters: Filters = {}): Promise<string[]> {
		//validate separator
		if (separator !== "_") {
			//throw an error when  \, /, :, *, ?, ", <, >, | is used in separator
			const invalidChars = new RegExp(/[\\/:*?"<>|]/);
			if (invalidChars.test(separator)) throw new Error(`Separator:${separator} cannot be used in filenames.`);
		}

		//validate src dst directory
		try {
			await super.validateSrcAndDst(srcDir, dstDir);
		} catch (e) {
			throw new Error(`Directory validtion failed in flattenDir.  ${e}`);
		}

		//listup file paths under srcDir
		let files: string[] = [];
		try {
			files = await super.getFilePaths(srcDir, filters);
		} catch (e) {
			throw new Error(`getFilePaths() in flattenDir failed.  ${e}`);
		}

		return files;
	}

	flattenFilePath(dirName: string, fileName: string, separator: string, srcDir: string, dstDir: string): string {
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
		//Flatten file path and file name is joinned by "=="
		const flattenFileName = this.adjustFileNameLength(fNamePrefix, fileName, "==", dstDir);

		return path.join(dstDir, flattenFileName);
	}

	adjustFileNameLength(prefix: string, fileName: string, separator: string, dstDir: string): string {
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
}

export default DirlFlatten;
