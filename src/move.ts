import fsp from "node:fs/promises";
import path from "node:path";
import DirlGet from "./get.js";
class DirlMove extends DirlGet {
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
					throw new Error(`${(e as Error).message} ${(e as Error).stack}`);
				}
			},
			diff: async (srcDir: string, dstDir: string, filters: Filters = {}) => {
				try {
					await this.transferDir(srcDir, dstDir, "copyDiff", filters);
				} catch (e) {
					throw new Error(`${(e as Error).message} ${(e as Error).stack}`);
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
			const TransferFilesResult = await this.transferFiles(srcDir, dstDir, filters, mode);
			this.printTransferResult(TransferFilesResult, mode);
		} catch (e) {
			throw new Error(`${(e as Error).message} ${(e as Error).stack}`);
		}
	}

	protected printTransferResult(result: TransferFilesResult, mode: Mode) {
		if (result.errors.length > 0) {
			const reset = "\x1b[0m"; // Reset color
			const redBackgroundWhiteTextBold = "\x1b[41m\x1b[37m\x1b[1m"; // Red background, white text, bold
			const whiteTextNoBackground = "\x1b[37m"; // White text, no background
			const title = "  ERROR  ";
			const restOfMessage = " ***File transfer completed except for below files.***";
			const errorMsg = `${redBackgroundWhiteTextBold}${title}${reset} ${whiteTextNoBackground}${restOfMessage}${reset}`;
			console.log(`${errorMsg}\r\n\r\m`);
			for (const error of result.errors) {
				console.log(`PATH : ${error.path}`);
				console.log(`ERROR: ${error.error}`);
				console.log("\r\n");
			}
		}
	}

	protected async transferFiles(
		srcDir: string,
		dstDir: string,
		filters: Filters,
		mode: Mode,
	): Promise<TransferFilesResult> {
		//Validate Dir
		try {
			super.validateSrcAndDst(srcDir, dstDir);
		} catch (e) {
			throw new Error(`validateSrcAndDst failed in createTransferFileList.  ${e}`);
		}

		//get source file paths
		let srcFilePaths: string[] = [];
		try {
			srcFilePaths = await super.getFilePaths(srcDir, filters);
		} catch (e) {
			throw new Error(`getFilePaths failed on transferFiles.  ${e}`);
		}

		//reverse order.  Working from bottom to top allowing empty dir to be deleted for mode=move*
		srcFilePaths.reverse();

		//init ErrorLog array
		const errorLog: { path: string; error: string }[] = [];

		//create dstFilePaths
		const dstFilePaths = srcFilePaths.map((srcFile) => {
			const srcFileReplace = path.join(path.dirname(srcDir), path.basename(srcDir));
			return path.join(dstDir, srcFile.replace(srcFileReplace, ""));
		});

		//check if the file is movable.  Move to next dirent if returned false

		let isFileMovableCheckResults = [];
		try {
			isFileMovableCheckResults = await Promise.all(
				dstFilePaths.map((dstFile, index) => super.isFileMovable(srcFilePaths[index], dstFile, mode)),
			);
		} catch (e) {
			throw new Error(`isFileMovable failed in transferFiles.  ${e}`);
		}

		//counters
		const targetFiles = isFileMovableCheckResults.filter((b) => true).length; //total number of valid target files (excl. filtered out files, isFileMovable false files)
		let movedFiles = 0; //total number of files successfully copied or moved
		let deletedFiles = 0; //total number of source files successfully deleted (only for mode=move*)

		//loop through srcFilePaths and copy files one by one.
		//If any async fn fails, log it to the errorLog and move on to the next file.
		for (let i = 0; i < srcFilePaths.length; i++) {
			//continue the loop if isFileMovableCheckResult was false
			if (!isFileMovableCheckResults[i]) continue;

			//create dstPath directory
			try {
				await fsp.mkdir(path.dirname(dstFilePaths[i]), { recursive: true });
			} catch (e) {
				errorLog.push({ path: srcFilePaths[i], error: `mkdir failed on ${path.dirname(dstFilePaths[i])} ${e}` });
				continue;
			}

			//copy file
			try {
				await fsp.copyFile(srcFilePaths[i], dstFilePaths[i]);
				movedFiles++;
			} catch (e) {
				errorLog.push({ path: srcFilePaths[i], error: `copyFile failed on ${srcFilePaths[i]}  ${e}` });
				continue;
			}

			//delete files for mode=move*
			if (/^move/.test(mode)) {
				//delete file
				try {
					await fsp.rm(srcFilePaths[i], { maxRetries: 3, retryDelay: 1000 });
				} catch (e) {
					errorLog.push({
						path: srcFilePaths[i],
						error: `Failed to delete file source file ${srcFilePaths[i]}.  ${e}`,
					});
				}

				//increment deletedFiles after the file is successfully deleted
				deletedFiles++;

				//delete dir if there's no more file left in source directory
				const currentDir = path.dirname(srcFilePaths[i]);
				try {
					const remainingDirents = await super.getFileCount(currentDir);
					if (remainingDirents === 0) await fsp.rmdir(currentDir);
				} catch (e) {
					errorLog.push({ path: currentDir, error: `Deleting empty directory failed on ${currentDir}  ${e}` });
				}
			}
		}

		return {
			files: targetFiles,
			moved: movedFiles,
			deleted: /^move/.test(mode) ? deletedFiles : null,
			errors: errorLog,
		};
	}
}

export default DirlMove;
