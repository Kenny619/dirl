import fsp from "node:fs/promises";
import path from "node:path";

class Dirlbass {
	protected async validateDirectoryPath(dirPath: string): Promise<void> {
		try {
			const stat = await fsp.stat(dirPath);
			if (!stat.isDirectory()) throw new Error(`${dirPath} is not a valid directory.`);
		} catch (e) {
			throw new Error(`validateDirectoryPath failed.  ${dirPath} is not a valid directory.  ${e}`);
		}
	}

	protected async validateFilePath(filePath: string): Promise<void> {
		try {
			const stat = await fsp.stat(filePath);
			if (!stat.isFile()) throw new Error(`${filePath} is not a valid file.`);
		} catch (e) {
			throw new Error(`validateFilePath failed.  ${filePath} is not a valid file path.  ${e}`);
		}
	}

	protected createRegexFilters(filters: Filters): RegexFilters {
		const validatedRegex: RegexFilters = {};
		for (const key in filters) {
			if (key === "dirNameFilter" || key === "fileNameFilter" || key === "extNameFilter") {
				try {
					validatedRegex[key as keyof RegexFilters] = new RegExp(filters[key as keyof RegexFilters] as string);
				} catch (e) {
					throw new Error(
						`createRegexFilters failed.  ${filters[key as keyof Filters]} is not a valid RegExp.  ${e as Error}`,
					);
				}
			}
		}
		return validatedRegex;
	}

	protected async isFilePathMatchFilters(filePath: string, filters: RegexFilters): Promise<boolean> {
		//validate filePath
		try {
			await this.validateFilePath(filePath);
		} catch (e) {
			throw new Error(`optionFilter failed.  ${filePath} is not a valid file path.  ${e}`);
		}

		//exit with true if threre's no filter in option
		if (Object.keys(filters).length === 0) return true;

		//provide same property name for each path as the 'filters' object
		const testPath: { [Key in FilterNames]: string } = {
			dirNameFilter: path.dirname(filePath),
			fileNameFilter: path.basename(filePath, path.extname(filePath)), //exclude file extention from test
			extNameFilter: path.extname(filePath),
		};

		//test each filter properties exist in filters.  If any of the filter fails, return false
		for (const key in filters) {
			if (!(filters[key as keyof typeof filters] as RegExp).test(testPath[key as keyof typeof testPath])) {
				return false;
			}
		}

		//If all filters passed the test, return true
		return true;
	}

	protected async isFileMovable(srcFilePath: string, dstFilePath: string, mode: Mode): Promise<boolean> {
		//throw error if source and destination are pointing to the same file
		if (srcFilePath === dstFilePath) {
			throw new Error(
				`srcFilePath and dstFilePath cannot be the same file.\r\nsrcFilePath: ${srcFilePath}\r\ndstFilePath: ${dstFilePath}`,
			);
		}

		//validate directory paths
		try {
			await this.validateFilePath(srcFilePath);
			await this.isDirectoryWritable(path.dirname(dstFilePath));
		} catch (e) {
			throw new Error(`${e}`);
		}

		//No further checks for *Overwrite
		if (mode === "copyOverwrite" || mode === "moveOverwrite") return true;

		//check if a file already exist in dstFilePath
		try {
			const dstFile = await fsp.stat(dstFilePath);

			//For mode===copyIfNew/moveIfNew.  check the last modified date.  Return true if src file is newer than dst
			if (mode === "copyIfNew" || mode === "moveIfNew") {
				const srcFile = await fsp.stat(srcFilePath);
				return srcFile.mtime > dstFile.mtime;
			}

			//For mode === copyDiff/moveDiff.  Return false if a file already exists in dstFilePath
			if (dstFile.isFile()) {
				return false;
			}

			//If its not a file, then return true.
			return true;
		} catch (_) {
			//There is no file on dstFilePath.  Return true and perform copy/move operation
			return true;
		}
	}

	protected async isDirectoryWritable(dstPath: string): Promise<boolean> {
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
}

export default Dirlbass;
