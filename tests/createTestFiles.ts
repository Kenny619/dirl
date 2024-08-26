import fsp from "node:fs/promises";
import path from "node:path";
import process from "node:process";
class TestFiles {
	private root: string;
	constructor(root: string) {
		this.root = path.resolve(process.cwd(), root);
	}
	async test() {
		console.log(this.root);
	}

	changeRoot(newRoot: string) {
		this.root = path.resolve(process.cwd(), newRoot);
	}

	async create(filePath: string, size: number, filler = "") {
		try {
			const outputPath = path.resolve(this.root, filePath);
			await fsp.mkdir(path.dirname(outputPath), { recursive: true });
			await fsp.writeFile(outputPath, this.generateContent(size, filler));
		} catch (err) {
			throw err as Error;
		}
	}

	async createDir(dirPath: string) {
		try {
			await fsp.mkdir(path.resolve(this.root, dirPath), { recursive: true });
		} catch (err) {
			throw err as Error;
		}
	}

	generateContent(size: number, filler = "") {
		const f = filler ? filler : Math.floor(Math.random() * 10).toString();
		const content = Array.from({ length: size }, () => f).join("");
		return content.length === size ? content : content.slice(0, size);
	}

	async clear() {
		try {
			await fsp.rm(this.root, { recursive: true, force: true });
		} catch (err) {
			throw err as Error;
		}
	}
}

export default TestFiles;
