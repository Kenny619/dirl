import { describe, it, expect } from "vitest";
import path from "node:path";
import dirl from "../../src/index";
import { generateTestFiles } from "./ifnew.testFiles";
import { expectedInputType, fileExists, isFileNew } from "../helper.tests";

//input type
const root = "./tests/testFiles/move/ifNew/src";
const newRoot = "./tests/testFiles/move/ifNew/dst";
await generateTestFiles(root, newRoot);

describe("move.ifNew() - scrDir input", async () => {
	//Unexpected input types throw error
	for (const [type, value] of Object.entries(expectedInputType("string"))) {
		it(`scrDir = ${type} throws error`, async () => {
			await expect(dirl.move.ifNew(value, newRoot)).rejects.toThrowError();
		});
	}

	//invalid directory path throws error
	it("scrDir = Invalid directory path throws error", async () => {
		await expect(dirl.move.ifNew(path.join(root, "/tests/"), newRoot)).rejects.toThrowError();
	});

	//invalid absolute path to a directory throws error
	it("scrDir = Invalid absolute path to a directory throws error", async () => {
		await expect(dirl.move.ifNew("/Users/kenny/dev/test", newRoot)).rejects.toThrowError();
	});

	//invalid path to a file throws error
	it("scrDir = Invalid path to a file 'tier1.jpg' throws error", async () => {
		await expect(dirl.move.ifNew("tier1.jpg", newRoot)).rejects.toThrowError();
	});

	//valid path to a file throws error
	it("scrDir = Valid absolute path to a file 'root/tier1.jpg' throws error", async () => {
		await expect(dirl.move.ifNew(path.join(root, "/tier1.jpg"), newRoot)).rejects.toThrowError();
	});

	//invalid absolute path to a file throws error
	it("scrDir = Invalid absolute path to a file throws error", async () => {
		await expect(dirl.move.ifNew(path.resolve(root, "./invalidFilePath.jpg"), newRoot)).rejects.toThrowError();
	});

	//valid absolute path to a file throws error
	it("scrDir = Valid absolute path to a file throws error", async () => {
		await expect(dirl.move.ifNew(path.resolve(root, "test.log"), newRoot)).rejects.toThrowError();
	});

	//valid path resolves to truthy value
	it("scrDir = Valid directory path resolves to truthy value", async () => {
		await expect(dirl.move.ifNew(path.join(root, "/relativePathSrc"), newRoot)).resolves.toBeTruthy();
	});

	//valid relative path
	it("scrDir = Valid absolute path to a directory resolves to truthy value", async () => {
		await expect(dirl.move.ifNew(path.resolve(root, "./absolutePathSrc"), newRoot)).resolves.toBeTruthy();
	});
});

describe("move.ifNew() - newRoot input", async () => {
	//Unexpected input types throw error
	for (const [type, value] of Object.entries(expectedInputType("string"))) {
		it(`newRoot = ${type} throws error`, async () => {
			await expect(dirl.move.ifNew(root, value)).rejects.toThrowError();
		});
	}

	//valid path resolves to truthy value
	it("newRoot = Valid path to a file resolves to truthy value", async () => {
		await expect(
			dirl.move.ifNew(path.join(root, "/relativePathDst"), path.join(newRoot, "/relativePathDst")),
		).resolves.toBeTruthy();
	});

	//valid relative path resolves to truthy value
	it("newRoot = Valid absolute path to a directory resolves to truthy value", async () => {
		await expect(
			dirl.move.ifNew(path.join(root, "absolutePathDst"), path.resolve(newRoot, "./absolutePathDst")),
		).resolves.toBeTruthy();
	});
});

describe("move.ifNew() - filter", async () => {
	it("filter = {ext:rar} fails to moves 1 file", async () => {
		const res = await dirl.move.ifNew(root, newRoot, { ext: "rar" });
		expect(res.succeeded).toHaveLength(0);
		expect(res.failed).toHaveLength(0);
		expect(await isFileNew(path.join(root, "test.rar"), path.join(newRoot, "test.rar"))).toBeFalsy();
		expect(await fileExists(path.join(root, "test.rar"))).toBeTruthy();
	});

	it("filter = {file: tier1} fails to moves 3 files", async () => {
		const res = await dirl.move.ifNew(root, newRoot, { file: "tier1" });
		expect(res.succeeded).toHaveLength(0);
		expect(res.failed).toHaveLength(0);
		expect(await isFileNew(path.join(root, "tier1.log"), path.join(newRoot, "tier1.log"))).toBeFalsy();
		expect(await fileExists(path.join(root, "tier1.log"))).toBeTruthy();
	});

	it("filter = {dir:empty } fails to moves 2 directories", async () => {
		const res = await dirl.move.ifNew(root, newRoot, { dir: "empty" });
		expect(res.succeeded).toHaveLength(0);
		expect(res.failed).toHaveLength(0);
		expect(await isFileNew(path.join(root, "empty"), path.join(newRoot, "empty"))).toBeFalsy();
		expect(await fileExists(path.join(root, "empty"))).toBeTruthy();
		expect(await fileExists(path.join(root, "empty/secondEmpty"))).toBeTruthy();
	});

	it("filter = {dir:filterTest, file:log} moves 1 file", async () => {
		const res = await dirl.move.ifNew(newRoot, root, { dir: "filterTest", file: "log" });
		expect(await fileExists(path.join(newRoot, "filterTest/logs.log"))).toBeFalsy();
		expect(await fileExists(path.join(root, "filterTest/logs.log"))).toBeTruthy();
	});

	it("filter = {dir:filterTest, ext:png} moves 1 file", async () => {
		const res = await dirl.move.ifNew(newRoot, root, { dir: "filterTest", ext: "png" });
		expect(await fileExists(path.join(newRoot, "filterTest/image.png"))).toBeFalsy();
		expect(await fileExists(path.join(root, "filterTest/image.png"))).toBeTruthy();
	});

	it("filter = {file:filterTest, ext:wma} moves 1 file", async () => {
		const res = await dirl.move.ifNew(newRoot, root, { file: "audio", ext: "wma" });
		expect(await fileExists(path.join(newRoot, "filterTest/audio.wma"))).toBeFalsy();
		expect(await fileExists(path.join(root, "filterTest/audio.wma"))).toBeTruthy();
	});

	it("filter = {file:filterTest, file:zipped, ext:zip} moves 1 file", async () => {
		const res = await dirl.move.ifNew(newRoot, root, { dir: "filterTest", file: "^zip", ext: "zip" });
		expect(await fileExists(path.join(newRoot, "filterTest/zipped.zip"))).toBeFalsy();
		expect(await fileExists(path.join(root, "filterTest/zipped.zip"))).toBeTruthy();
	});
});

// describe("move.ifNew() - all", async () => {
// 	it("srcDir = newRoot when all files are copied", async () => {
// 		const res = await dirl.move.ifNew(root, newRoot);
// 		await expect(fileExists(root)).resolves.toBeFalsy();
// 	});
// });
