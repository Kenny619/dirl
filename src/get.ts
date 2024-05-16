import fsp from "node:fs/promises";
import path from "node:path";
import Dirlbass from "./base.js";
class DirlGet extends Dirlbass {
	public get: Get;

	constructor() {
		super();
		this.get = {
			filePaths: async (rootDir: string, filters: Filters = {}): Promise<string[]> => {
				try {
					return await this.getFilePaths(rootDir, filters);
				} catch (e) {
					throw new Error(`${e}`);
				}
			},
			dirPaths: async (rootDir: string, filters: Filters = {}): Promise<string[]> => {
				try {
					return await this.getDirPaths(rootDir, filters);
				} catch (e) {
					throw new Error(`${e}`);
				}
			},
			fileCount: async (rootDir: string, filters: Filters = {}): Promise<number> => {
				try {
					return await this.getFileCount(rootDir, filters);
				} catch (e) {
					throw new Error(`${e}`);
				}
			},
			fileSizes: async (rootDir: string, filters: Filters = {}): Promise<{ path: string; size: string }[]> => {
				try {
					return await this.getFileSizes(rootDir, filters);
				} catch (e) {
					throw new Error(`${e}`);
				}
			},
			dirSizes: async (rootDir: string, filters: Filters = {}): Promise<{ dir: string; size: string }[]> => {
				try {
					return await this.getDirSizes(rootDir, filters);
				} catch (e) {
					throw new Error(`${e}`);
				}
			},
			duplicateFiles: async (rootDir: string, filters: Filters = {}): Promise<string[][]> => {
				try {
					return this.getDuplicates(rootDir, filters);
				} catch (e) {
					throw new Error(`${e}`);
				}
			},
		};
	}

	async getFileSizes(root: string, filters: Filters = {}): Promise<{ path: string; size: string }[]> {
		try {
			await super.validateDirectoryPath(root);
		} catch (e) {
			throw new Error(`${root} is not a valid directory.  ${e}`);
		}

		let filePaths = [];
		try {
			filePaths = await this.getFilePaths(root, filters);
		} catch (e) {
			throw new Error(`getFilePath() failed in getFileSize.  ${e}`);
		}

		const fileStats = await Promise.all(filePaths.map((file) => fsp.stat(file)));
		const fileSizes = fileStats.map((file) => file.size);

		return filePaths.map((file, index) => {
			return { path: file, size: this.formatFileSizeInBytes(fileSizes[index]) };
		});
	}

	async getDirSizes(root: string, filters: Filters = {}): Promise<{ dir: string; size: string }[]> {
		let dirPaths = [];

		try {
			dirPaths = await this.getDirPaths(root, filters);
		} catch (e) {
			throw new Error(`getDirPath failed in getDirSizes.  ${e}`);
		}

		//insert root dir.  Path.join to align the format, replace to delete the trailing slash/backslash
		dirPaths.unshift(path.join(root).replace(/[\\\\|\\|\/|\/\/]$/, ""));

		//create {dirpath: filesize} object
		const dirSizes: { [Key: string]: number } = {};
		for (const dir of dirPaths) dirSizes[dir] = 0;

		try {
			const dirSizesSum = await this.getFileSizeSum(dirSizes, filters);
			return Object.keys(dirSizesSum).map((key) => {
				return { dir: key, size: this.formatFileSizeInBytes(dirSizes[key]) };
			});
			//.filter((directory) => directory.size !== "0B ");
		} catch (e) {
			throw new Error(`getFIleSizeSum failed during getDirSizes.  ${e}`);
		}
	}

	async getFileSizeSum(dirSizes: { [Key: string]: number }, filters: Filters) {
		let filePaths = [];
		for (const dir in dirSizes) {
			try {
				filePaths = await this.getFilePaths(dir, filters);
			} catch (e) {
				throw new Error(`readdir failed in getFileSizeSum.  ${e}`);
			}

			//apply filer and store result<bool> to filtered
			const stats = await Promise.all(filePaths.map((file) => fsp.stat(file)));
			const sizeSum = stats.reduce((acc, cur) => {
				return cur.isFile() ? cur.size + acc : acc;
			}, 0);

			let _dir = dir;
			while (Object.hasOwn(dirSizes, _dir)) {
				dirSizes[_dir] = dirSizes[_dir] + sizeSum;
				const matched = _dir.match(/^((.*)[\\\\|\\|\/|\/\/])(?:.+?)(?=\/*$)/); //match path without last directory without trailing slash/backslash
				if (matched) _dir = matched[2];
			}
		}

		return dirSizes;
	}
	formatFileSizeInBytes(bytes: number): string {
		const units = ["B ", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB", "RB", "QB"];
		let i = 0;
		let b = bytes;

		while (b >= 1024 && i < units.length - 1) {
			b /= 1024;
			i++;
		}

		return `${b.toFixed(2)}${units[i]}`;
	}

	async getFilePaths(root: string, filters: Filters = {}): Promise<string[]> {
		//root directory validation
		try {
			await super.validateDirectoryPath(root);
		} catch (e) {
			throw new Error(`${root} is not a valid directory.  ${e}`);
		}

		let Dirents = [];
		const filePaths = [];
		const regexpFilters = super.createRegexFilters(filters);
		try {
			Dirents = await fsp.readdir(root, { withFileTypes: true, recursive: true });
		} catch (e) {
			throw new Error(`readdir() in getFilePaths failed.  ${e}`);
		}

		for (const dirent of Dirents) {
			const filePath = path.join(dirent.path, dirent.name);
			if (dirent.isFile()) {
				if (regexpFilters) {
					(await super.isPathMatchingFilters(filePath, regexpFilters)) && filePaths.push(filePath);
				} else {
					filePaths.push(filePath);
				}
			}
		}

		return filePaths;
	}

	async getDirPaths(root: string, filters: Filters = {}): Promise<string[]> {
		//root directory validation
		try {
			await super.validateDirectoryPath(root);
		} catch (e) {
			throw new Error(`${root} is not a valid directory.  ${e}`);
		}

		const dirPaths = [];

		//Create regexfilters only if dirNameFilter has value
		let regexpFilters = {};
		if (Object.hasOwn(filters, "dir")) {
			regexpFilters = super.createRegexFilters(filters);
		}

		let Dirents = [];
		try {
			Dirents = await fsp.readdir(root, { recursive: true, withFileTypes: true });
		} catch (e) {
			throw new Error(`readdir() in getFilePaths failed.  ${e}`);
		}

		for (const dirent of Dirents) {
			const entryPath = path.join(dirent.path, dirent.name);
			if (dirent.isDirectory()) {
				if (regexpFilters) {
					(await super.isPathMatchingFilters(entryPath, regexpFilters)) && dirPaths.push(entryPath);
				} else {
					dirPaths.push(entryPath);
				}
			}
		}
		return dirPaths;
	}

	async getFileCount(root: string, filters: Filters = {}): Promise<number> {
		try {
			const filePaths: string[] = await this.get.filePaths(root, filters);
			return filePaths.length;
		} catch (e) {
			throw new Error(`getFileCount failed.  ${e}`);
		}
	}

	async getDuplicates(root: string, filters: Filters = {}): Promise<Duplicates> {
		//validate root
		try {
			super.validateDirectoryPath(root);
		} catch (e) {
			throw new Error(`validateDirectyPath failed in getDuplicate.  ${e}`);
		}

		//get file path
		let filePaths = [];
		try {
			filePaths = await this.get.filePaths(root, filters);
		} catch (e) {
			throw new Error(`get.filePaths() in getDuplicates failed.  ${e}`);
		}

		//create {filesize: [filepath]} object
		let sizeGroup: FileSizeGroup = {};
		try {
			sizeGroup = await this.groupFilesBySize(filePaths);
		} catch (e) {
			throw new Error(`groupFilesBySize in getDuplicate failed.  ${e}`);
		}

		//Among the fileSizeGroup, keep the files with same contents.  Return in string[][] format.
		return this.findDuplicatesFromSizeGroup(sizeGroup);
	}

	async groupFilesBySize(filePaths: string[]): Promise<{ [Key: number]: string[] }> {
		//get filesizes of each files
		let fileSizes = [];
		try {
			const stats = await Promise.all(filePaths.map((file) => fsp.stat(file)));
			fileSizes = stats.map((stat) => stat.size);
		} catch (e) {
			throw new Error(`fs stat failed in groupFilesBySize.  ${e}`);
		}

		//create an object of {filesize: [file path]} and group file path with same file size
		const sizeGroup: { [Key: number]: string[] } = {};
		return filePaths.reduce((acc, cur, index) => {
			if (Object.hasOwn(acc, fileSizes[index])) {
				acc[fileSizes[index]].push(cur);
			} else {
				acc[fileSizes[index]] = [cur];
			}
			return acc;
		}, sizeGroup);
	}

	async findDuplicatesFromSizeGroup(fileGroupBySize: { [Key: number]: string[] }): Promise<string[][]> {
		//get the file content of each file and compare among the same group

		//return array
		const results = [];

		for (const pathGroup of Object.values(fileGroupBySize)) {
			//continue the loop if pathGroup contains contain only 1 path = no equal size files.
			if (pathGroup.length === 1) continue;

			//get file buffers from each file path pathGroup
			let buffers = [];
			try {
				buffers = await Promise.all(pathGroup.map((file) => fsp.readFile(file)));
			} catch (e) {
				throw new Error(`getDuplicate failed while reading file buffer.  ${e}`);
			}

			//compare
			const duplicates = []; //duplicate file path storage
			let left = 0; //left pointer
			let right = 1; // right pointer
			//while right and left pointers were within the range of the buffers array.
			//Exit loop if either of pointers are out of the range.

			//repeat until left and right pointers are next to each other at the end of buffer array.
			while (left !== buffers.length - 1 && right !== buffers.length) {
				//compare buffers on left and right pointers.
				//If they are equal, push both paths to duplicates array.
				buffers[left].equals(buffers[right]) && duplicates.push(pathGroup[left], pathGroup[right]);

				//Move on to next comparison.  Increment right pointer by 1.
				right++;

				//if right pointer is at the end of the array, move left pointer by 1.
				//Reset right pointer's position by putting it on the right side of the left pointer.
				if (right === buffers.length) {
					left++;
					right = left + 1;
				}
			}

			//If any duplicates were found, create an unique list of duplicate paths
			//and push them to results array
			if (duplicates.length > 0) results.push(Array.from(new Set(duplicates)));
		}
		return results;
	}
}
export default DirlGet;

// const dirl = new dirlGet();
// const sizes = dirl.get.sizeOfDirs("./src/tests/files/duplicates/");
// console.log(sizes);
