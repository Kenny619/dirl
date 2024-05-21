import fsp from "node:fs/promises";
import DirlFlatten from "../flat.js";
import { describe, expect, test } from "vitest";

/*Scenarios
fn: flattenAll 
01: Empty src dir throws error
02: Invalid dst dir throws error
03: Invalid separator charactor throws error
04: FlattenAll moves 12 files to under dst dir.
05: FlattenAll with {ext:jpg} filter moves 3 files under dst dir
*/

async function deleteFiles(dst: string) {
	const files = await dirl.get.filePaths(dst);
	const del = files.map((file) => fsp.unlink(file));
	await Promise.all(del);
}
const dirl = new DirlFlatten();

describe("Fn: flattenAll", () => {
	test("01: Empty src dir throws error", async () => {
		const src = "./src/tests/files/emptyDir/";
		const dst = "./src/tests/files/dstFlatten/";
		await expect(dirl.flatten.all(src, dst)).rejects.toThrowError();
	});

	test("02: Invalid dst dir throws error", async () => {
		const src = "./src/tests/files/emptyDir/";
		const dst = "Z:\\";
		await expect(dirl.flatten.all(src, dst)).rejects.toThrowError();
	});
	test("03: Invalid separator charactor throws error", async () => {
		const src = "./src/tests/files/flat/";
		const dst = "./src/tests/files/dstFlatten/";
		await expect(dirl.flatten.all(src, dst, "**/")).rejects.toThrowError();
	});
	test("04: FlattenAll moves 12 files to under dst dir.", async () => {
		const src = "./src/tests/files/flat/";
		const dst = "./src/tests/files/dstFlatten/";
		await dirl.flatten.all(src, dst);
		await expect(dirl.get.fileCount(dst)).resolves.toBe(12);
		await deleteFiles(dst);
	});
	test("05: FlattenAll with {ext:jpg} filter moves 3 files under dst dir.", async () => {
		const src = "./src/tests/files/flat/";
		const dst = "./src/tests/files/dstFlatten/";
		await dirl.flatten.all(src, dst, "---", { ext: "jpg" });
		await expect(dirl.get.fileCount(dst)).resolves.toBe(4);
		await deleteFiles(dst);
	});
});
