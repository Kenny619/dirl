import { describe, it, expect } from "vitest";
import path from "node:path";
import dirl from "../../src/index";

import { generateTestFiles } from "./get.testFiles";
import { expectedInputType } from "../helper.tests";
//input type
const root = "./tests/testFiles/get/fileCount/src";
const dstDir = "./tests/testFiles/get/fileCount/dst";
await generateTestFiles(root, dstDir);

describe("fileCount() - input", async () => {
	//Unexpected input types throw error
	for (const [type, value] of Object.entries(expectedInputType("string"))) {
		it(`scrDir = ${type} throws error`, async () => {
			await expect(dirl.get.fileCount(value)).rejects.toThrowError();
		});
	}

	//invalid relative path to a directory throws error
	it("scrDir = Invalid relative path to a directory throws error", async () => {
		await expect(dirl.get.fileCount(path.join("./test"))).rejects.toThrowError();
	});

	//invalid absolute path to a directory throws error
	it("scrDir = Invalid absolute path to a directory throws error", async () => {
		await expect(dirl.get.fileCount(path.resolve(root, "./invalid"))).rejects.toThrowError();
	});

	//invalid relative path to a file throws error
	it("scrDir = Invalid relative path to a file throws error", async () => {
		await expect(dirl.get.fileCount("tier1.log")).rejects.toThrowError();
	});

	//invalid absolute path to a file throws error
	it("scrDir = Invalid absolute path to a file throws error", async () => {
		await expect(dirl.get.fileCount(path.resolve(root, "./invalidFilePath.jpg"))).rejects.toThrowError();
	});

	//Valid relative path to a file throws error
	it("scrDir = Valid relative path to a file throws error", async () => {
		await expect(dirl.get.fileCount("./tests/helper.tests.ts")).rejects.toThrowError();
	});

	//Valid absolute path to a file throws error
	it("scrDir = Valid absolute path to a file throws error", async () => {
		await expect(dirl.get.fileCount(path.resolve(root, "./tier1.log"))).rejects.toThrowError();
	});

	//valid relative path resolves to truthy value
	it("scrDir = Valid relative directory path resolves to truthy value", async () => {
		await expect(dirl.get.fileCount(path.join(root, "/tier2"))).resolves.toBeTruthy();
	});

	//valid relative path
	it("scrDir = Valid absolute path to a directory resolves to truthy value", async () => {
		await expect(dirl.get.fileCount(path.resolve(root, "./duplicate/"))).resolves.toBeTruthy();
		// expect(await isFileNew(path.join(root, "/absolutePathSrc"), path.join(dstDir, "/absolutePathSrc"))).toBeFalsy();
	});
});

describe("fileCount() - output", async () => {
	it("./tests/testFiles/get/ returns 12 files", async () => {
		await expect(dirl.get.fileCount(root)).resolves.toEqual(12);
	});
	it("./tests/testFiles/get/tier2/ returns 6 files", async () => {
		await expect(dirl.get.fileCount(path.join(root, "/tier2"))).resolves.toEqual(6);
	});
	it("./tests/testFiles/get/tier2/tier3/ returns 3 files", async () => {
		await expect(dirl.get.fileCount(path.join(root, "/tier2/tier3"))).resolves.toEqual(3);
	});
	it("./tests/testFiles/get/duplicate/ returns 3 files", async () => {
		await expect(dirl.get.fileCount(path.join(root, "/duplicate"))).resolves.toEqual(3);
	});
	it("./tests/testFiles/get/empty/ returns 0 files", async () => {
		await expect(dirl.get.fileCount(path.join(root, "/empty"))).resolves.toEqual(0);
	});
});

describe("fileCount() - filter", async () => {
	it("./tests/testFiles/get/ with {dir:duplicate} returns 3 files", async () => {
		await expect(dirl.get.fileCount(root, { dir: "duplicate" })).resolves.toEqual(3);
	});
	it("./tests/testFiles/get/ with {file:tier2} returns 6 files", async () => {
		await expect(dirl.get.fileCount(root, { file: "tier2" })).resolves.toEqual(3);
	});
	it("./tests/testFiles/get/ with {ext: log} returns 4 files", async () => {
		await expect(dirl.get.fileCount(root, { ext: "log" })).resolves.toEqual(4);
	});
	it("./tests/testFiles/get/ with {dir: tier2, file: tier3} returns 3 files", async () => {
		await expect(dirl.get.fileCount(root, { dir: "tier2", file: "tier3" })).resolves.toEqual(3);
	});
	it("./tests/testFiles/get/ with {dir: tier2, ext: png} returns 2 files", async () => {
		await expect(dirl.get.fileCount(root, { dir: "tier2", ext: "png" })).resolves.toEqual(2);
	});
	it("./tests/testFiles/get/ with {dir: tier2, file:3 ext: png} returns 1 file", async () => {
		await expect(dirl.get.fileCount(root, { dir: "tier2", file: "3", ext: "png" })).resolves.toEqual(1);
	});
});

describe("fileCount() - value", async () => {
	it("./tests/testFiles/get/empty returns 0", async () => {
		await expect(dirl.get.fileCount(path.join(root, "/empty"))).resolves.toEqual(0);
	});
	it("./tests/testFiles/get/ with {dir: tier2, file:3 ext: png} returns 1", async () => {
		await expect(dirl.get.fileCount(root, { dir: "tier2", file: "3", ext: "png" })).resolves.toEqual(1);
	});
});
