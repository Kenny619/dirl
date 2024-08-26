import { describe, it, expect } from "vitest";
import path from "node:path";
import dirl from "../../src/index";

import { generateTestFiles } from "./get.testFiles";
import { expectedInputType } from "../helper.tests";
//input type
const root = "./tests/testFiles/get/duplicates/src";
const dstDir = "./tests/testFiles/get/duplicates/dst";
await generateTestFiles(root, dstDir);

describe("duplicateFiles() - input", async () => {
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

describe("duplicateFiles() - output", async () => {
	it("root returns 6 sets", async () => {
		await expect(dirl.get.duplicateFiles(root)).resolves.toHaveLength(6);
	});
	it("./tier2/ returns 3 sets", async () => {
		await expect(dirl.get.duplicateFiles(path.join(root, "/tier2"))).resolves.toHaveLength(3);
	});
	it("./tests/testFiles/get/tier2/tier3/ returns 0 sets", async () => {
		await expect(dirl.get.duplicateFiles(path.join(root, "/tier2/tier3"))).resolves.toHaveLength(0);
	});
	it("./tests/testFiles/get/duplicate/ returns 0 sets", async () => {
		await expect(dirl.get.duplicateFiles(path.join(root, "/duplicate"))).resolves.toHaveLength(0);
	});
	it("./tests/testFiles/get/empty/ returns 0 sets", async () => {
		await expect(dirl.get.duplicateFiles(path.join(root, "/empty"))).resolves.toHaveLength(0);
	});
});

describe("duplicateFiles() - filter", async () => {
	it("filter = {dir:tier3} returns 0 sets", async () => {
		await expect(dirl.get.duplicateFiles(root, { dir: "tier3" })).resolves.toHaveLength(0);
	});
	it("filter = {dir:tier2} returns 3 sets", async () => {
		await expect(dirl.get.duplicateFiles(root, { dir: "tier2" })).resolves.toHaveLength(3);
	});
	it("filter = {ext: log} returns 2 sets", async () => {
		await expect(dirl.get.duplicateFiles(root, { ext: "log" })).resolves.toHaveLength(2);
	});
	it("filter = {dir: tier2, file: tier3} returns 0 sets", async () => {
		await expect(dirl.get.duplicateFiles(root, { dir: "tier2", file: "tier3" })).resolves.toHaveLength(0);
	});
	it("filter = {dir: tier2, ext: jpg} returns 1 set", async () => {
		await expect(dirl.get.duplicateFiles(root, { dir: "tier2", ext: "png" })).resolves.toHaveLength(1);
	});
	it("filter = {dir: tier2, file:3 ext: png} returns 0 sets", async () => {
		await expect(dirl.get.duplicateFiles(root, { dir: "tier2", file: "3", ext: "png" })).resolves.toHaveLength(0);
	});
});

describe("duplicateFiles() - value", async () => {
	it("./tests/testFiles/get/ with {dir: tier2, file:3 ext: png} returns 1 set", async () => {
		const res = await dirl.get.duplicateFiles(root, { dir: "tier2", ext: "png" });
		expect(res).toEqual([[path.resolve(root, "./tier2/tier2.png"), path.resolve(root, "./tier2/tier3/tier3.png")]]);
	});
	it("./tests/testFiles/get/ with {ext: log} returns ", async () => {
		const res = await dirl.get.duplicateFiles(root, { ext: "log" });
		expect(res).toEqual([
			[path.resolve(root, "./duplicate/logFile.log"), path.resolve(root, "./tier1.log")],
			[path.resolve(root, "./tier2/tier2.log"), path.resolve(root, "./tier2/tier3/tier3.log")],
		]);
	});
});
