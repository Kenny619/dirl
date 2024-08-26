import { describe, it, expect } from "vitest";
import fsp from "node:fs/promises";
import path from "node:path";
import dirl from "../../src/index";
import { generateTestFiles } from "./diff.testFiles";
import { expectedInputType, fileExists, isFileNew } from "../helper.tests";

//input type
const root = "./tests/testFiles/move/diff/src";
const newRoot = "./tests/testFiles/move/diff/dst";
await generateTestFiles(root, newRoot);

describe("move.diff() - scrDir input", async () => {
	//Unexpected input types throw error
	for (const [type, value] of Object.entries(expectedInputType("string"))) {
		it(`scrDir = ${type} throws error`, async () => {
			await expect(dirl.move.diff(value, newRoot)).rejects.toThrowError();
		});
	}

	//invalid directory path throws error
	it("scrDir = Invalid directory path throws error", async () => {
		await expect(dirl.move.diff(path.join(root, "/tests/"), newRoot)).rejects.toThrowError();
	});

	//invalid absolute path to a directory throws error
	it("scrDir = Invalid absolute path to a directory throws error", async () => {
		await expect(dirl.move.diff("/Users/kenny/dev/test", newRoot)).rejects.toThrowError();
	});

	//invalid path to a file throws error
	it("scrDir = Invalid path to a file 'tier1.jpg' throws error", async () => {
		await expect(dirl.move.diff("tier1.jpg", newRoot)).rejects.toThrowError();
	});

	//valid path to a file throws error
	it("scrDir = Valid absolute path to a file 'root/tier1.jpg' throws error", async () => {
		await expect(dirl.move.diff(path.join(root, "/tier1.jpg"), newRoot)).rejects.toThrowError();
	});

	//invalid absolute path to a file throws error
	it("scrDir = Invalid absolute path to a file throws error", async () => {
		await expect(dirl.move.diff(path.resolve("invalidFilePath.jpg"), newRoot)).rejects.toThrowError();
	});

	//valid absolute path to a file throws error
	it("scrDir = Valid absolute path to a file throws error", async () => {
		await expect(dirl.move.diff(path.resolve(root, "test.log"), newRoot)).rejects.toThrowError();
	});

	//valid path resolves to truthy value
	it("scrDir = Valid directory path resolves to truthy value", async () => {
		await expect(dirl.move.diff(path.join(root, "/relativePathSrc"), newRoot)).resolves.toBeTruthy();
		//expect(await isFileNew(path.join(root, "/relativePathSrc"), path.join(newRoot, "/relativePathSrc"))).toBeFalsy();
	});

	//valid relative path
	it("scrDir = Valid absolute path to a directory resolves to truthy value", async () => {
		await expect(dirl.move.diff(path.resolve(root, "./absolutePathSrc"), newRoot)).resolves.toBeTruthy();
		// expect(await isFileNew(path.join(root, "/absolutePathSrc"), path.join(newRoot, "/absolutePathSrc"))).toBeFalsy();
	});
});

describe("move.diff() - newRoot input", async () => {
	//Unexpected input types throw error
	for (const [type, value] of Object.entries(expectedInputType("string"))) {
		it(`newRoot = ${type} throws error`, async () => {
			await expect(dirl.move.diff(root, value)).rejects.toThrowError();
		});
	}

	//valid arelative path resolves to truthy value
	it("newRoot = Valid path to a file resolves to truthy value", async () => {
		await expect(
			dirl.move.diff(path.join(root, "/relativePathDst"), path.join(newRoot, "/relativePathDst")),
		).resolves.toBeTruthy();
		expect(await isFileNew(path.join(root, "/relativePathDst"), path.join(newRoot, "/relativePathDst"))).toBeFalsy();
	});

	//valid absolute path resolves to truthy value
	it("newRoot = Valid absolute path to a directory resolves to truthy value", async () => {
		await expect(
			dirl.move.diff(path.join(root, "absolutePathDst"), path.resolve(newRoot, "./absolutePathDst")),
		).resolves.toBeTruthy();
		expect(await isFileNew(path.join(root, "/absolutePathDst"), path.join(newRoot, "/absolutePathDst"))).toBeFalsy();
	});
});

describe("move.diff() - filter", async () => {
	it("filter = {ext:rar} fails to move 1 file", async () => {
		const res = await dirl.move.diff(root, newRoot, { ext: "rar" });
		expect(res.succeeded).toHaveLength(0);
		expect(res.failed).toHaveLength(0);
		expect(await isFileNew(path.join(root, "test.rar"), path.join(newRoot, "test.rar"))).toBeFalsy();
	});

	it("filter = {file: tier1} fails to move 3 files", async () => {
		const res = await dirl.move.diff(root, newRoot, { file: "tier1" });
		expect(res.succeeded).toHaveLength(0);
		expect(res.failed).toHaveLength(0);
		expect(await isFileNew(path.join(root, "tier1.log"), path.join(newRoot, "tier1.log"))).toBeFalsy();
	});

	it("filter = {dir:empty } fails to move 2 directories", async () => {
		const res = await dirl.move.diff(root, newRoot, { dir: "empty" });
		expect(res.succeeded).toHaveLength(0);
		expect(res.failed).toHaveLength(0);
		expect(await isFileNew(path.join(root, "empty"), path.join(newRoot, "empty"))).toBeFalsy();
	});

	it("filter = {dir:filterTest, file:log} moves 1 file", async () => {
		const res = await dirl.move.diff(newRoot, root, { dir: "filterTest", file: "log" });
		expect(await fileExists(path.join(root, "filterTest/logs.log"))).toBeTruthy();
		expect(await fileExists(path.join(newRoot, "filterTest/logs.log"))).toBeFalsy();
		// expect(
		// 	await isFileNew(path.join(newRoot, "filterTest/logs.log"), path.join(root, "filterTest/logs.log")),
		// ).toBeFalsy();
	});

	it("filter = {dir:filterTest, ext:png} moves 1 file", async () => {
		const res = await dirl.move.diff(newRoot, root, { dir: "filterTest", ext: "png" });
		expect(await fileExists(path.join(newRoot, "filterTest/image.png"))).toBeFalsy();
		expect(await fileExists(path.join(root, "filterTest/image.png"))).toBeTruthy();
		// expect(
		// 	await isFileNew(path.join(root, "filterTest/image.png"), path.join(newRoot, "filterTest/image.png")),
		// ).toBeTruthy();
	});

	it("filter = {file:filterTest, ext:wma} moves 1 file", async () => {
		const res = await dirl.move.diff(newRoot, root, { file: "audio", ext: "wma" });
		expect(await fileExists(path.join(newRoot, "filterTest/audio.wma"))).toBeFalsy();
		expect(await fileExists(path.join(root, "filterTest/audio.wma"))).toBeTruthy();
		// expect(
		// 	await isFileNew(path.join(root, "filterTest/audio.wma"), path.join(newRoot, "filterTest/audio.wma")),
		// ).toBeTruthy();
	});

	it("filter = {file:filterTest, file:zipped, ext:zip} moves 1 file", async () => {
		const res = await dirl.move.diff(newRoot, root, { dir: "filterTest", file: "^zip", ext: "zip" });
		expect(await fileExists(path.join(newRoot, "filterTest/zipped.zip"))).toBeFalsy();
		expect(await fileExists(path.join(root, "filterTest/zipped.zip"))).toBeTruthy();
		// expect(
		// 	await isFileNew(path.join(root, "filterTest/zipped.zip"), path.join(newRoot, "filterTest/zipped.zip")),
		// ).toBeTruthy();
	});
});

// describe("move.diff() - all", async () => {
// 	it("srcDir = newRoot when all files are copied", async () => {
// 		const res = await dirl.move.diff(root, newRoot);
// 		await expect(fileExists(root)).resolves.toBeFalsy();
// 	});
// });
