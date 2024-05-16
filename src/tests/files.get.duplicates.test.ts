import DirlGet from "../get.ts";
import { describe, expect, test } from "vitest"; /*Scenarios

fn: validateSrcAndDst
01. root=duplicates returns 2 sets of duplicates
02. root=duplicates/ filter={ext:jpg} returns 1 set of duplicates with 2 files
03. root=duplicates/ filter={ext:txt} returns 1 set of duplicates with 2 files

*/
const dirl = new DirlGet();
const sizes = await dirl.getDuplicates("./src/tests/files/duplicates");
console.log(sizes);

describe("Fn: getDuplicates:", () => {
	test("01. root=duplicates returns 2 sets of duplicates", async () => {
		const root = "./src/tests/files/duplicates/";
		await expect(dirl.getDuplicates(root)).resolves.toHaveLength(2);
	});

	test("02. root=duplicates/ filter={ext:jpg} returns 1 set of duplicates with 2 files", async () => {
		const root = "./src/tests/files/duplicates/";
		const filter = { ext: "jpg" };
		await expect(dirl.getDuplicates(root, filter)).resolves.toHaveLength(1);
		const paths = await dirl.getDuplicates(root);
		expect(paths[0].length).toBe(2);
	});
	test("03. root=duplicates/ filter={ext:txt} returns 1 set of duplicates with 2 files", async () => {
		const root = "./src/tests/files/duplicates/";
		const filter = { ext: "txt" };
		await expect(dirl.getDuplicates(root, filter)).resolves.toHaveLength(1);
		const paths = await dirl.getDuplicates(root);
		expect(paths[0].length).toBe(2);
	});
});
