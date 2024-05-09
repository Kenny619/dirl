import fsp from "node:fs/promises";
import path from "node:path";
import dirLGet from "./get.js";
class dirlFlatten extends dirLGet {
	public flatten;
	constructor() {
		super();
		this.flatten = {
			all: () => {},
			unique: () => {},
		};
	}

	async flattenDir(srcDir: string, dstDir: string, separator = "_", filters: Filters = {}): Promise<void> {
		//validate separator
		if (separator !== "_") {
			//throw an error when  \, /, :, *, ?, ", <, >, | is used in separator
			const invalidChars = new RegExp(/[\\/:*?"<>|]/);
			if (invalidChars.test(separator)) throw new Error(`Separator:${separator} cannot be used in filenames.`);
		}

		//throw an error when dir path are invalid
		try {
			await super.validateDirectoryPath(srcDir);
			await super.isDirectoryWritable(dstDir);
			const filesInSrc = await fsp.readdir(srcDir);
			if (filesInSrc.length === 0) {
				throw new Error(`No file found in ${srcDir}`);
			}
		} catch (e) {
			throw new Error(`Directory validtion failed.  ${e}`);
		}

		//listup file paths under srcDir
		let files: string[] = [];
		try {
			files = await super.getFilePaths(srcDir, filters);
		} catch (e) {
			throw new Error(`getFilePaths() in flattenDir failed.  ${e}`);
		}

		const copyFiles = files.map((file) => {
			const dstFilePath = this.getDstFilePath(path.dirname(file), path.basename(file), separator, srcDir, dstDir);
			return fsp.copyFile(file, dstFilePath);
		});
		try {
			await Promise.all(copyFiles.map((file) => file));
		} catch (e) {
			throw new Error(`copyFile failed in flattenDir.  ${e}`);
		}

		console.log("flatten complete");
	}

	getDstFilePath(dirName: string, fileName: string, separator: string, srcDir: string, dstDir: string): string {
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
		const flattenFileName = this.adjustFileNameLength(fNamePrefix, fileName, separator, dstDir);

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

export default dirlFlatten;
