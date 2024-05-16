import { a } from "vitest/dist/suite-IbNSsUWN.js";
import DirlGet from "../get.ts";
import { describe, expect, test } from "vitest"; /*Scenarios

fn: validateSrcAndDst
01. root=duplicates/dir2/dir3/ returns 4 entries. first file size is 952B   
02. root=duplicates/ filter={ext:jpg} returns 4 entries.  last file size is 248KB 
03. root=filter filter={ext:png} returns 0 entries.
04. root=filter filter={file:unique3} returns 1 entry.  file size is 1KB

*/
const dirl = new DirlGet();
const sizes = await dirl.getDirSizes("./src/tests/files/duplicates", { ext: "png" });
console.log(sizes);

describe("Fn: getDirSizes:", () => {
	test("01. root=duplicates/dir2/dir3/ returns 1 entries. dir size is 253KB", async () => {
		const root = "./src/tests/files/duplicates/dir2/dir3/";
		await expect(dirl.getDirSizes(root)).resolves.toHaveLength(1);
		const paths = await dirl.getDirSizes(root);
		expect(paths[0].size).toMatch(/253(.*?)KB/);
	});

	test("02. root=duplicates/ filter={ext:jpg} returns 3 entries.  last file size is1.9MB", async () => {
		const root = "./src/tests/files/duplicates/";
		const filter = { ext: "jpg" };
		await expect(dirl.getDirSizes(root, filter)).resolves.toHaveLength(3);
		const paths = await dirl.getDirSizes(root);
		expect(paths[0].size).toMatch(/2MB/);
	});
	test("03. root=duplicates/ filter={ext:png} returns 0 entries", async () => {
		const root = "./src/tests/files/duplicates/";
		const filter = { ext: "png" };
		await expect(dirl.getDirSizes(root, filter)).resolves.toHaveLength(0);
	});
	test("04. root=filter filter={file:unique3} returns 1 entry.  file size is 1KB", async () => {
		const root = "./src/tests/files/duplicates/";
		const filter = {
			file: "unique3",
		};
		await expect(dirl.getDirSizes(root, filter)).resolves.toHaveLength(3);
		const paths = await dirl.getDirSizes(root, filter);
		expect(paths[0].size).toMatch(/2.(.*)KB/);
	});
});
