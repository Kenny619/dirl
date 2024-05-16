import DirlGet from "../get.ts";
import { describe, expect, test } from "vitest"; /*Scenarios

fn: validateSrcAndDst
01. invalid root throws 'not a valid directory' error 
02. root=filter returns 10
03. root=filter filter={ext:png} returns 2
04. root=filter filter={file:doc} returns 1

*/
const dirl = new DirlGet();
describe("Fn: getDirPaths", () => {
	test("01. invalid root throws 'not a valid directory' error", async () => {
		const root = "./src/tests/files/filter/tmp";
		await expect(dirl.getFileCount(root)).rejects.toThrowError(/not a valid/);
	});

	test("02. root=filter returns 10", async () => {
		const root = "./src/tests/files/filter/";
		await expect(dirl.getFileCount(root)).resolves.toBe(10);
	});
	test("03. root=filter filter={ext:png} returns 2", async () => {
		const root = "./src/tests/files/filter/";
		const filter = {
			ext: "png",
		};
		await expect(dirl.getFileCount(root, filter)).resolves.toBe(2);
	});
	test("04. root=filter filter={file:doc} returns 1", async () => {
		const root = "./src/tests/files/filter/";
		const filter = {
			file: "doc",
		};
		await expect(dirl.getFileCount(root, filter)).resolves.toBe(1);
	});
});
