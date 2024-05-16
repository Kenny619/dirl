import DirlGet from "../get.js";
import { describe, expect, test } from "vitest";

/*Scenarios

fn: validateSrcAndDst
01. invalid root throws 'not a valid directory' error 
02. root=filter No matching filter returns 0 path 
03. root=filter filter={dir:dir3, file:5, ext:word} returns 1 path
04. root=filter filter=dir:dir2 returns 2 path

*/
const dirl = new DirlGet();
const root = "./src/tests/files/filter/";
const filter = {
	dir: "dir2",
	file: "log",
	ext: "jpg",
};
const dirents = await dirl.getDirPaths(root, filter);
for (const dirent of dirents) {
	console.dir(dirent, { depth: null });
}
describe("Fn: getDirPaths", () => {
	test("01. invalid root throws 'not a valid directory' error", async () => {
		const root = "./src/tests/files/filter/tmp";
		await expect(dirl.getDirPaths(root)).rejects.toThrowError(/not a valid directory/);
	});

	test("02. root=filter No matching filter returns 0 path", async () => {
		const root = "./src/tests/files/filter/";
		const filter = {
			dir: "tmp",
			file: "log",
			ext: "jpg",
		};
		await expect(dirl.getDirPaths(root, filter)).resolves.toHaveLength(0);
	});
	test("03. root=filter filter={dir:dir3, file:5, ext:word} returns 1 path", async () => {
		const root = "./src/tests/files/filter/";
		const filter = {
			dir: "dir3",
			file: "5",
			ext: "word",
		};
		await expect(dirl.getDirPaths(root, filter)).resolves.toHaveLength(1);
	});
	test("04. root=filter filter=dir:dir2 returns 2 path", async () => {
		const root = "./src/tests/files/filter/";
		const filter = {
			dir: "dir2",
		};
		await expect(dirl.getDirPaths(root, filter)).resolves.toHaveLength(2);
	});
});
