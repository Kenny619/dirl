import dirl from "../src/index";
import { describe, expect, test } from "vitest";

/*Scenarios
fn: flattenUnique 
01: Empty src dir throws error
02: Invalid dst dir throws error
03: Invalid separator charactor throws error
04: FlattenAll moves 12 files to under dst dir.
05: FlattenAll with {ext:jpg} filter moves 3 files under dst dir
*/

const duplicate = "./src/tests/files/duplicates";
const empty = "./src/tests/files/emptyDir";
const flat = "./src/tests/files/empty/flat";
const practice = "C:\\dev\\practice";
console.log("PRINT START----");
await dirl.print.fileSizes(empty);
console.log("PRINT END----");
// const src = "./src/tests/files/flat/";
// const dst = "./src/tests/files/dstFlatten/";
// await deleteFiles(dst);
// await dirl.flatten.unique(src, dst);

describe("Fn: print", () => {
	test("01: Empty src dir throws error", async () => {
		const src = "./src/tests/files/emptyDir/";
		const dst = "./src/tests/files/dstFlatten/";
		await expect(dirl.print.dirPaths(src)).resolves.toBeUndefined();
	});
});

/*
	test("02: Invalid dst dir throws error", async () => {
		const src = "./src/tests/files/emptyDir/";
		const dst = "Z:\\";
		await expect(dirl.flatten.unique(src, dst)).rejects.toThrowError();
	});
	test("03: Invalid separator charactor throws error", async () => {
		const src = "./src/tests/files/flat/";
		const dst = "./src/tests/files/dstFlatten/";
		await expect(dirl.flatten.unique(src, dst, "**")).rejects.toThrowError();
	});
	test("04: FlattenAll moves 12 files to under dst dir.", async () => {
		const src = "./src/tests/files/flat/";
		const dst = "./src/tests/files/dstFlatten/";
		await deleteFiles(dst);
		await dirl.flatten.unique(src, dst);
		await expect(dirl.get.fileCount(dst)).resolves.toBe(8);
	});
	test("05: FlattenUnique with {ext:jpg} filter moves 3 files under dst dir.", async () => {
		const src = "./src/tests/files/flat/";
		const dst = "./src/tests/files/dstFlatten/";
		await deleteFiles(dst);
		await dirl.flatten.unique(src, dst, "---", { ext: "jpg" });
		await expect(dirl.get.fileCount(dst)).resolves.toBe(2);
	});
	test("06: FlattenAll with {file:duplicate} filter moves 2 files under dst dir", async () => {
		const src = "./src/tests/files/flat/";
		const dst = "./src/tests/files/dstFlatten/";
		await deleteFiles(dst);
		await dirl.flatten.unique(src, dst, "_", { file: "duplicate" });
		await expect(dirl.get.fileCount(dst)).resolves.toBe(2);
	});
    
});
*/
