import dirl from "../index.js";
import { describe, expect, test } from "vitest";

await dirl.copy.ifNew("./src/tests/files/duplicates", "./src/tests/files/duplicates-2", { ext: "txt" });

/*Scenarios
fn: validateSrcAndDst
01. srcDir=duplicates returns 2 sets of duplicates
02. srcDir=duplicates/ filter={ext:jpg} returns 1 set of duplicates with 2 files
03. srcDir=duplicates/ filter={ext:txt} returns 1 set of duplicates with 2 files

*/

describe.skip("Fn: copy.ifNew:", () => {
	test("01. srcDir=duplicates returns 2 sets of duplicates", async () => {
		const srcDir = "./src/tests/files/copyIfNew/";
		const dstDir = "./src/tests/files/dstCopyIfNew/";
		await expect(dirl.copy.ifNew(srcDir, dstDir)).resolves.toHaveLength(2);
	});

	test("02. srcDir=duplicates/ filter={ext:jpg} returns 1 set of duplicates with 2 files", async () => {
		const srcDir = "./src/tests/files/duplicates/";
		const filter = { ext: "jpg" };
		await expect(dirl.copy.ifNew(srcDir, filter)).resolves.toHaveLength(1);
		const paths = await dirl.copy.ifNew(srcDir, dstDir);
		expect(paths[0].length).toBe(2);
	});
	test("03. srcDir=duplicates/ filter={ext:txt} returns 1 set of duplicates with 2 files", async () => {
		const srcDir = "./src/tests/files/duplicates/";
		const filter = { ext: "txt" };
		await expect(dirl.copy.ifNew(srcDir, filter)).resolves.toHaveLength(1);
		const paths = await dirl.copy.ifNew(srcDir, dstDir);
		expect(paths[0].length).toBe(2);
	});
});
