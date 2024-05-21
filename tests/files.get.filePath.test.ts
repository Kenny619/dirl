import DirlGet from "../get.ts";
import { describe, expect, test } from "vitest";

/*Scenarios

fn: validateSrcAndDst
01. invalid root throws 'not a valid directory' error 
02. root=filter No matching filter returns 0 path 
03. root=filter filter={dir:dir3, file:5, ext:word} returns 1 path
04. root=filter filter=dir:dir2 returns 8 path

*/
const dirl = new DirlGet();
const root = "./src/tests/files/filter/";
describe("Fn: filePaths", () => {
	test("01. invalid root throws 'not a valid directory' error", async () => {
		const root = "./src/tests/files/filter/tmp";
		await expect(dirl.getFilePaths(root)).rejects.toThrowError(/not a valid directory/);
	});

	test("02. root=filter No matching filter returns 0 path", async () => {
		const root = "./src/tests/files/filter/";
		const filter = {
			dir: "tmp",
			file: "log",
			ext: "jpg",
		};
		await expect(dirl.getFilePaths(root, filter)).resolves.toHaveLength(0);
	});
	test("03. root=filter filter={dir:dir3, file:5, ext:word} returns 1 path", async () => {
		const root = "./src/tests/files/filter/";
		const filter = {
			dir: "dir3",
			file: "5",
			ext: "word",
		};
		await expect(dirl.getFilePaths(root, filter)).resolves.toHaveLength(1);
	});
	test("04. root=filter filter=dir:dir2 returns 8 path", async () => {
		const root = "./src/tests/files/filter/";
		const filter = {
			dir: "dir2",
		};
		await expect(dirl.getFilePaths(root, filter)).resolves.toHaveLength(6);
	});
});
