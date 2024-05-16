import fsp from "node:fs/promises";
import path from "node:path";
import DirlGet from "./get.js";
class DirlPrint extends DirlGet {
	public print: Print;
	private noItems: string;

	constructor() {
		super();
		this.noItems = "No items found in ";
		this.print = {
			filePaths: async (rootDir: string, filters: Filters = {}): Promise<void> => {
				try {
					const filePath = await super.getFilePaths(rootDir, filters);
					if (filePath.length === 0) {
						console.log(`${this.noItems}${rootDir}`);
						return;
					}
					for (const file of filePath) console.log(file);
				} catch (e) {
					throw new Error(`${e}`);
				}
			},
			dirPaths: async (rootDir: string, filters: Filters = {}): Promise<void> => {
				try {
					const dirPath = await this.getDirPaths(rootDir, filters);

					if (dirPath.length === 0) {
						console.log(`${this.noItems}${rootDir}`);
						return;
					}
					for (const dir of dirPath) console.log(dir);
				} catch (e) {
					throw new Error(`${e}`);
				}
			},
			fileCount: async (rootDir: string, filters: Filters = {}): Promise<void> => {
				try {
					const count = await super.getFileCount(rootDir, filters);
					console.log(` path: ${rootDir}`);
					console.log(`files: ${count}`);
				} catch (e) {
					throw new Error(`${e}`);
				}
			},
			fileSizes: async (rootDir: string, filters: Filters = {}): Promise<void> => {
				try {
					const fileSizes = await super.getFileSizes(rootDir, filters);

					if (fileSizes.length === 0) {
						console.log(`${this.noItems}${rootDir}`);
						return;
					}
					const maxLength = fileSizes.reduce((acc, cur): number => {
						return cur.size.length > acc ? cur.size.length : acc;
					}, 0);

					console.log(`${"Size".padStart(maxLength, " ")} Files`);
					for (const file of fileSizes) {
						console.log(`${file.size.padStart(maxLength, " ")} ${file.path}`);
					}
				} catch (e) {
					throw new Error(`${e}`);
				}
			},
			dirSizes: async (rootDir: string, filters: Filters = {}): Promise<void> => {
				try {
					const dirSizes = await super.getDirSizes(rootDir, filters);
					const maxLength = dirSizes.reduce((acc, cur): number => {
						return cur.size.length > acc ? cur.size.length : acc;
					}, 0);

					console.log(`${"Size".padStart(maxLength, " ")} Directories`);
					for (const dir of dirSizes) {
						console.log(`${dir.size.padStart(maxLength, " ")} ${dir.dir}`);
					}
				} catch (e) {
					throw new Error(`${e}`);
				}
			},
			duplicateFiles: async (rootDir: string, filters: Filters = {}): Promise<void> => {
				try {
					const duplicates = await super.getDuplicates(rootDir, filters);
					if (duplicates.length === 0) {
						console.log(`${this.noItems}${rootDir}`);
						return;
					}
					const set = duplicates.length === 1 ? "set" : "sets";
					console.log(`Identified ${duplicates.length}${set} of duplicates\r\n`);

					for (let i = 1; i <= duplicates.length; i++) {
						console.log(`Set${i}`);
						for (const path of duplicates[i - 1]) console.log(path);
						console.log("\r\n");
					}
				} catch (e) {
					throw new Error(`${e}`);
				}
			},
		};
	}

	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	noFiles(root: string, result: any[]): void {
		if (result.length === 0) {
			console.log(`No items found in ${root}`);
			process.exit(0);
		}
	}
}
export default DirlPrint;
