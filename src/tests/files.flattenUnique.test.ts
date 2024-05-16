import fsp from "node:fs/promises";
import DirlFlatten from "../flat.js";
import { describe, expect, test } from "vitest";

/*Scenarios
fn: flattenUnique 
01: Empty src dir throws error
02: Invalid dst dir throws error
03: Invalid separator charactor throws error
04: FlattenAll moves 12 files to under dst dir.
05: FlattenAll with {ext:jpg} filter moves 3 files under dst dir
*/

const dirl = new DirlFlatten();
async function deleteFiles(dst: string) {
	try {
		const files = await dirl.get.filePaths(dst);
		const del = files.map((file) => fsp.unlink(file));
		await Promise.all(del);
	} catch (_) {}
}
// const src = "./src/tests/files/flat/";
// const dst = "./src/tests/files/dstFlatten/";
// await deleteFiles(dst);
// await dirl.flatten.unique(src, dst);

describe("Fn: flattenUnique", () => {
	test("01: Empty src dir throws error", async () => {
		const src = "./src/tests/files/emptyDir/";
		const dst = "./src/tests/files/dstFlatten/";
		await expect(dirl.flatten.unique(src, dst)).rejects.toThrowError();
	});

	test("02: Invalid dst dir throws error", async () => {
		const src = "./src/tests/files/emptyDir/";
		const dst = "Z:\\";
		await expect(dirl.flatten.unique(src, dst)).rejects.toThrowError();
	});
	test("03: Invalid separator charactor throws error", async () => {
		const src = "./src/tests/files/flat/";
		const dst = "./src/tests/files/dstFlatten/";
		await expect(dirl.flatten.unique(src, dst, "**/")).rejects.toThrowError();
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
