import fsp from "node:fs/promises";
import path from "node:path";
import dirL from "./base.js";
class dirlGet extends dirL {
	public get: Get;

	constructor() {
		super();
		this.get = {
			filePaths: async (rootDir: string, filters: Filters): Promise<string[]> => {
				try {
					return await this.getFilePaths(rootDir, filters);
				} catch (e) {
					throw new Error(`${e}`);
				}
			},
			fileCount: async (rootDir: string, filters: Filters): Promise<number> => {
				try {
					return await this.getFileCount(rootDir, filters);
				} catch (e) {
					throw new Error(`${e}`);
				}
			},
			sizeOfFiles: async (rootDir: string, filters: Filters): Promise<{ path: string; size: string }[]> => {
				try {
					return await this.getFileSizes(rootDir, filters);
				} catch (e) {
					throw new Error(`${e}`);
				}
			},
			duplicates: async (rootDir: string, filters: Filters): Promise<string[][]> => {
				try {
					return this.getDuplicates(rootDir, filters);
				} catch (e) {
					throw new Error(`${e}`);
				}
			},
		};
	}

	async getFileSizes(root: string, filters: Filters = {}): Promise<{ path: string; size: string }[]> {
		let filePaths = [];
		try {
			filePaths = await this.getFilePaths(root, filters);
		} catch (e) {
			throw new Error(`getFilePath() failed in getFileSize.  ${e}`);
		}

		const fileStats = await Promise.all(filePaths.map((file) => fsp.stat(file)));
		const fileSizes = fileStats.map((file) => file.size);

		const output = [];
		for (let i = 0; i < filePaths.length; i++) {
			output.push({ path: filePaths[i], size: this.formatFileSizeInBytes(fileSizes[i]) });
		}

		return output;
	}

	formatFileSizeInBytes(bytes: number): string {
		const units = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB", "RB", "QB"];
		let i = 0;
		let b = bytes;

		while (b >= 1024 && i < units.length - 1) {
			b /= 1024;
			i++;
		}

		return `${Number.parseFloat(b.toFixed(2))} ${units[i]}`;
	}

	async getFilePaths(root: string, filters: Filters = {}): Promise<string[]> {
		//root directory validation
		try {
			await super.validateDirectoryPath(root);
		} catch (e) {
			throw new Error(`${root} is not a valid directory.  ${e}`);
		}

		let filePaths = [];
		try {
			filePaths = (await fsp.readdir(root, { withFileTypes: true, recursive: true }))
				.filter((f) => !f.isDirectory())
				.map((f) => path.join(f.path, f.name));
		} catch (e) {
			throw new Error(`readdir() in getFilePaths failed.  ${e}`);
		}

		const regexpFilters = super.createRegexFilters(filters);

		if (filters) {
			const filterResults = await Promise.all(
				filePaths.map((file) => super.isFilePathMatchFilters(file, regexpFilters)),
			);
			return filePaths.filter((_, i) => filterResults[i]);
		}

		return filePaths;
	}

	async getFileCount(root: string, filters: Filters = {}): Promise<number> {
		try {
			const filePaths: string[] = await this.get.filePaths(root, filters);
			return filePaths.length;
		} catch (e) {
			throw new Error(`getFileCount failed.  ${e}`);
		}
	}

	async getDuplicates(root: string, filters: Filters = {}): Promise<string[][]> {
		let filePaths = [];
		try {
			filePaths = await this.get.filePaths(root, filters);
		} catch (e) {
			throw new Error(`get.filePaths() in getDuplicates failed.  ${e}`);
		}

		let noUniqueFileSizePaths = [];
		try {
			const sizeSortedFilePaths = await this.sortFileBySize(filePaths);
			noUniqueFileSizePaths = this.deleteUniqueFile(sizeSortedFilePaths);
		} catch (e) {
			throw new Error(`softFileBySize() in getDuplicate failed.  ${e}`);
		}

		const groupedFileSizePaths = this.groupByFileSize(noUniqueFileSizePaths);

		try {
			return await this.findDuplicatesAmongGroup(groupedFileSizePaths);
		} catch (e) {
			throw new Error(`findDuplicatesAmongGroup() in getDuplicate failed.  ${e}`);
		}
	}

	async findDuplicatesAmongGroup(filePathGroups: { path: string; size: number }[][]): Promise<string[][]> {
		//get the file content of each file and compare among the same group
		const results = [];
		for (const group of filePathGroups) {
			//create an array of file buffers from each files in a group.
			let buffers = [];
			try {
				buffers = await Promise.all(group.map((file) => fsp.readFile(file.path)));
			} catch (e) {
				throw new Error(`getDuplicate failed while reading file buffer.  ${e}`);
			}

			//compare
			const duplicates = [];
			let i = 1;
			while (buffers.length > 1) {
				//compare each buffers to left most buffer.
				//push both to duplicates array if they are equal.
				if (buffers[0].equals(buffers[i])) {
					duplicates.push(group[0].path, group[i].path);
				}

				//if i is at the end of buffers, then splice off the first cell and reset i to 1.
				//Otherwise increment i by 1;
				if (i === buffers.length - 1) {
					buffers.splice(0, 1);
					i = 1;
				} else {
					i++;
				}
			}
			//If any duplicates were found, create an unique list of duplicate paths
			//and push them to results array
			if (duplicates.length > 0) {
				results.push(Array.from(new Set(duplicates)));
			}
		}
		return results;
	}

	groupByFileSize(filePath: { path: string; size: number }[]): { path: string; size: number }[][] {
		const groups = [];
		const sizeArr = filePath.map((file) => file.size);

		//splice the same sizes into an array and push it to groups
		while (filePath.length > 0) {
			groups.push(
				filePath.splice(sizeArr.indexOf(sizeArr[0]), sizeArr.lastIndexOf(sizeArr[0]) - sizeArr.indexOf(sizeArr[0]) + 1),
			);
		}

		return groups;
	}

	deleteUniqueFile(filePaths: { path: string; size: number }[]): { path: string; size: number }[] {
		const sizeArr = filePaths.map((file) => {
			return file.size;
		});

		const uniqueArr = sizeArr.map((file) => {
			return sizeArr.indexOf(file) === sizeArr.lastIndexOf(file);
		});

		return filePaths.filter((_, index) => uniqueArr[index]);
	}

	async sortFileBySize(filePaths: string[]): Promise<
		{
			path: string;
			size: number;
		}[]
	> {
		//create an array of filepath, fs.stat of that filepath, and the size of the file (initial=0)
		const fileSizeArr = filePaths.map((filePath) => {
			const stat = fsp.stat(filePath);
			return { path: filePath, stat: stat, size: 0 };
		});
		try {
			//resolve all fsp.stat in fileSizeArr[i].stat
			const fileStatArr = await Promise.all(fileSizeArr.map((file) => file.stat));

			//Using fsp.stat in fileStatArr, update size property in fileSizeArr
			for (let i = 0; i < fileSizeArr.length; i++) {
				fileSizeArr[i].size = fileStatArr[i].size;
			}

			//sort 1fileSizeArr by the value of size property
			fileSizeArr.sort((a, b) => {
				return a.size - b.size;
			});

			//return  filePath and filesize
			return fileSizeArr.map((file) => {
				return {
					path: file.path,
					size: file.size,
				};
			});
		} catch (e) {
			throw new Error(`sortFileBySize failed.  ${e}`);
		}
	}
}
export default dirlGet;
