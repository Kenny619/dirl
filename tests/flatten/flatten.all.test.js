import { describe, it, expect } from "vitest";
import path from "node:path";
import dirl from "../../src/index";
import { generateTestFiles } from "./flatten.testFiles";
import { expectedInputType, invalidSeparators, validSeparators } from "../helper.tests";

//input type
const root = "./tests/testFiles/flatten/all/src";
const dstDir = "./tests/testFiles/flatten/all/dst";
const separatorDstDir = "./tests/testFiles/flatten/all/separatorDstDir";
const filterDstDir = "./tests/testFiles/flatten/all/filterDstDir";
await generateTestFiles(root, dstDir);

describe("flatten.all() - scrDir input", async () => {
	//Unexpected input types throw error
	for (const [type, value] of Object.entries(expectedInputType("string"))) {
		it(`scrDir = ${type} throws error`, async () => {
			await expect(dirl.flatten.all(value, dstDir)).rejects.toThrowError();
		});
	}

	//invalid directory path throws error
	it("scrDir = Invalid directory path throws error", async () => {
		await expect(dirl.flatten.all(path.join(root, "/tests/"), dstDir)).rejects.toThrowError();
	});

	//invalid absolute path to a directory throws error
	it("scrDir = Invalid absolute path to a directory throws error", async () => {
		await expect(dirl.flatten.all("/Users/kenny/dev/test", dstDir)).rejects.toThrowError();
	});

	//invalid path to a file throws error
	it("scrDir = Invalid path to a file 'tier1.jpg' throws error", async () => {
		await expect(dirl.flatten.all("tier1.jpg", dstDir)).rejects.toThrowError();
	});

	//valid path to a file throws error
	it("scrDir = Valid absolute path to a file 'root/tier1.jpg' throws error", async () => {
		await expect(dirl.flatten.all(path.join(root, "/tier1.jpg"), dstDir)).rejects.toThrowError();
	});

	//invalid absolute path to a file throws error
	it("scrDir = Invalid absolute path to a file throws error", async () => {
		await expect(
			dirl.flatten.all("/Users/kenny/dev/dirl/tests/testFiles/movesinvalidFilePath.jpg", dstDir),
		).rejects.toThrowError();
	});

	//valid absolute path to a file throws error
	it("scrDir = Valid absolute path to a file throws error", async () => {
		await expect(
			dirl.flatten.all(path.join(root, "/Users/kenny/dev/dirl/tests/testFiles/movescopy.log"), dstDir),
		).rejects.toThrowError();
	});

	//valid path resolves to truthy value
	it("scrDir = Valid directory path resolves to truthy value", async () => {
		await expect(dirl.flatten.all(path.join(root, "/relativePathSrc"), dstDir)).resolves.toBeTruthy();
	});

	//valid relative path
	it("scrDir = Valid absolute path to a directory resolves to truthy value", async () => {
		await expect(
			dirl.flatten.all("/Users/kenny/dev/dirl/tests/testFiles/flatten/all/src/absolutePathSrc", dstDir),
		).resolves.toBeTruthy();
		// expect(await isFileNew(path.join(root, "/absolutePathSrc"), path.join(dstDir, "/absolutePathSrc"))).toBeFalsy();
	});
});

describe("flatten.all() - dstDir input", async () => {
	//Unexpected input types throw error
	for (const [type, value] of Object.entries(expectedInputType("string"))) {
		it(`dstDir = ${type} throws error`, async () => {
			await expect(dirl.flatten.all(root, value)).rejects.toThrowError();
		});
	}

	//valid path resolves to truthy value
	it("dstDir = Valid path to a file resolves to truthy value", async () => {
		await expect(dirl.flatten.all(path.join(root, "/relativePathDst"), dstDir)).resolves.toBeTruthy();
	});

	//valid relative path resolves to truthy value
	it("dstDir = Valid absolute path to a directory resolves to truthy value", async () => {
		await expect(dirl.flatten.all(path.join(root, "absolutePathDst"), dstDir)).resolves.toBeTruthy();
	});
});

describe("flatten.all() - separator input", async () => {
	//invalid separator input types throw error
	for (const symbol of invalidSeparators()) {
		it(`separator = ${symbol} throws error`, async () => {
			await expect(dirl.flatten.all(path.join(root, "valiDir"), dstDir, symbol)).rejects.toThrowError();
		});
	}

	//valid separator input types
	for (const symbol of validSeparators()) {
		it(`separator = ${symbol} resolves to truthy value`, async () => {
			await expect(dirl.flatten.all(path.join(root, "validDir"), separatorDstDir, symbol)).resolves.toBeTruthy();
		});
	}
});

describe("flatten.all() - filter", async () => {
	it("filter = {ext:rar} fails to copy 1 file", async () => {
		await expect(dirl.flatten.all(root, filterDstDir, { ext: "rar" })).resolves.toBeTruthy();
		expect(await dirl.get.fileCount(filterDstDir, { ext: "rar" })).toBe(1);
	});

	it("filter = {file: tier1} fails to copy 3 files", async () => {
		await expect(dirl.flatten.all(root, filterDstDir, { file: "tier1" })).resolves.toBeTruthy();
		expect(await dirl.get.fileCount(filterDstDir, { file: "tier1" })).toBe(3);
	});

	it("filter = {dir:empty } fails to copy 2 directories", async () => {
		await expect(dirl.flatten.all(root, filterDstDir, { dir: "empty" })).resolves.toBeTruthy();
	});

	it("filter = {dir:filterTest, file:log} copies 1 file", async () => {
		await expect(dirl.flatten.all(root, filterDstDir, { dir: "filterTest", file: "log" })).resolves.toBeTruthy();
		expect(await dirl.get.fileCount(filterDstDir, { file: "filterTest(.*?)log" })).toBe(1);
	});

	it("filter = {dir:filterTest, ext:png} copies 1 file", async () => {
		await expect(dirl.flatten.all(root, filterDstDir, { dir: "filterTest", ext: "png" })).resolves.toBeTruthy();
		expect(await dirl.get.fileCount(filterDstDir, { file: "filterTest", ext: "png" })).toBe(1);
	});

	it("filter = {file:filterTest, ext:wma} copies 1 file", async () => {
		await expect(dirl.flatten.all(root, filterDstDir, { file: "audio", ext: "wma" })).resolves.toBeTruthy();
		expect(await dirl.get.fileCount(filterDstDir, { file: "audio", ext: "wma" })).toBe(1);
	});

	it("filter = {file:filterTest, file:zipped, ext:zip} copies 1 file", async () => {
		await expect(
			dirl.flatten.all(root, filterDstDir, { dir: "filterTest", file: "^zip", ext: "zip" }),
		).resolves.toBeTruthy();
		expect(await dirl.get.fileCount(filterDstDir, { file: "filterTest(.*?)zipped", ext: "zip" })).toBe(1);
	});
});

describe("flatten.all() - all", async () => {
	it("srcDir = dstDir when all files are copied", async () => {
		const res = await dirl.flatten.all(root, dstDir);
		const cntSrc = await dirl.get.fileCount(root);
		const cntDst = await dirl.get.fileCount(dstDir);
		expect(cntSrc === cntDst).toBe(true);
	});
});
