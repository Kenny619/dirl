import fsp from "node:fs/promises";
import path from "node:path";
import Dirlbass from "./base.js";
class dirlMove extends Dirlbass {
	public move: Transfer;
	public copy: Transfer;

	constructor() {
		super();
		this.move = {
			overwrite: async (srcDir: string, dstDir: string, filters: Filters = {}) => {
				try {
					await this.transferDir(srcDir, dstDir, "moveOverwrite", filters);
				} catch (e) {
					throw new Error(`${e}`);
				}
			},
			diff: async (srcDir: string, dstDir: string, filters: Filters = {}) => {
				try {
					await this.transferDir(srcDir, dstDir, "moveDiff", filters);
				} catch (e) {
					throw new Error(`${e}`);
				}
			},
			ifNew: async (srcDir: string, dstDir: string, filters: Filters = {}) => {
				try {
					await this.transferDir(srcDir, dstDir, "moveIfNew", filters);
				} catch (e) {
					throw new Error(`${e}`);
				}
			},
		};

		this.copy = {
			overwrite: async (srcDir: string, dstDir: string, filters: Filters = {}) => {
				try {
					await this.transferDir(srcDir, dstDir, "copyOverwrite", filters);
				} catch (e) {
					throw new Error(`${e}`);
				}
			},
			diff: async (srcDir: string, dstDir: string, filters: Filters = {}) => {
				try {
					await this.transferDir(srcDir, dstDir, "copyDiff", filters);
				} catch (e) {
					throw new Error(`${e}`);
				}
			},
			ifNew: async (srcDir: string, dstDir: string, filters: Filters = {}) => {
				try {
					await this.transferDir(srcDir, dstDir, "copyIfNew", filters);
				} catch (e) {
					throw new Error(`${e}`);
				}
			},
		};
	}

	protected async transferDir(srcDir: string, dstDir: string, mode: Mode, filters: Filters) {
		try {
			const filePaths = await this.createTransferFileList(srcDir, dstDir, filters);
			if (filePaths) {
				const result = await this.transferFiles(filePaths, srcDir, dstDir, mode);
				this.printTransferResult(result, "moveOverwrite");
			}
		} catch (e) {
			throw new Error(`${e}`);
		}
	}

	protected printTransferResult(result: TransferFilesResult, mode: Mode) {
		console.log(`Transfer completed.  mode:${mode}`);
		console.log(`transferred: ${result.moved}/${result.files}`);
		if (/^move/.test(mode)) console.log(`deleted: ${result.deleted}/${result.files}`);
		if (result.errors.length > 0) {
			console.log("ERRORS:");
			for (const error of result.errors) {
				console.log(`PATH : ${error.path}`);
				console.log(`ERROR: ${error.error}`);
				console.log("\r\n");
			}
		}
	}

	protected async createTransferFileList(srcDir: string, dstDir: string, filters: Filters): Promise<string[]> {
		//Validate srcDir
		try {
			await super.validateDirectoryPath(srcDir);
			if (srcDir === dstDir) throw new Error("srcDir and dstDir cannot be the same.");
		} catch (e) {
			throw new Error(`${srcDir} is not a valid directory.`);
		}

		//validate dstDir.
		try {
			await super.isDirectoryWritable(dstDir);
		} catch (e) {
			throw new Error(`${dstDir} does not exist or not writable.  ${e}`);
		}

		//Get all filePaths under srcDir.
		let filepaths: string[] = [];
		try {
			filepaths = (await fsp.readdir(srcDir, { withFileTypes: true, recursive: true }))
				.filter((f) => !f.isDirectory())
				.map((f) => path.join(f.path, f.name));
		} catch (e) {
			throw new Error(`Failed to acquire filenames from ${srcDir}.  ${e}`);
		}

		//create Regexp filter
		const regexpFilters = super.createRegexFilters(filters);
		if (filters) {
			//async filter condition -> create a promises of check result, await to resolve all, and use them as filter condition.
			try {
				const optionFilterResults = await Promise.all(
					filepaths.map((f) => super.isFilePathMatchFilters(f, regexpFilters)),
				);
				filepaths = filepaths.filter((_, i) => optionFilterResults[i]);
			} catch (e) {
				throw new Error(`Failed to apply filter to filenames.  ${e}`);
			}
		}

		return filepaths;
	}
	protected async transferFiles(
		files: string[],
		srcDir: string,
		dstDir: string,
		mode: Mode,
	): Promise<TransferFilesResult> {
		//working from bottom to top of dir structure so that empty dir will be deleted for mode = move*
		const filePaths = files.reverse();

		let movedCount = 0;
		let deletedCount = 0;
		const errorLog: ErrorLog = [];

		for (const srcFilePath of filePaths) {
			//create dst file path
			const dstPath = path.dirname(srcFilePath).replace(srcDir, dstDir);
			const dstFilePath = path.join(dstPath, path.basename(srcFilePath));

			//Skip copying/moving if file already exists in destination and cannot be copied/moved
			try {
				if (!(await super.isFileMovable(srcFilePath, dstFilePath, mode))) continue;
			} catch (e) {
				errorLog.push({ file: srcFilePath, error: `isFileMovable failed.  ${e}` });
				continue;
			}

			try {
				//copy file
				await fsp.mkdir(path.dirname(dstFilePath), { recursive: true });
				await fsp.copyFile(srcFilePath, dstFilePath);
				movedCount++;

				//delete file if mode = move*
				if (/^move/.test(mode)) {
					//delete file
					try {
						await fsp.rm(srcFilePath, { maxRetries: 3, retryDelay: 1000 });
						deletedCount++;
					} catch (e) {
						errorLog.push({ file: srcFilePath, error: `Failed to delete file.  ${e}` });
					}

					//delete dir if there's no more file left in bottom dir
					try {
						const remainingFiles = await fsp.readdir(path.dirname(srcFilePath));
						if (remainingFiles.length === 0) await fsp.rmdir(path.dirname(srcFilePath));
					} catch (e) {
						errorLog.push({ file: path.dirname(srcFilePath), error: `Failed to delete directory  ${e}` });
					}
				}
			} catch (e) {
				errorLog.push({ file: srcFilePath, error: `Failed to transfer file.  ${e}` });
			}
		}

		return {
			files: filePaths.length,
			moved: movedCount,
			deleted: /^move/.test(mode) ? deletedCount : null,
			errors: errorLog,
		};
	}
}

export default dirlMove;
