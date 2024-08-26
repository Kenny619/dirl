import { describe, it, expect } from "vitest";
import fsp from "node:fs/promises";
import path from "node:path";
import dirl from "../../src/index";
import { generateTestFiles } from "./overwrite.testFiles";
import { expectedInputType, fileExists } from "../helper.tests";

//input type
const root = "./tests/testFiles/move/overwrite/src";
const dstDir = "./tests/testFiles/move/overwrite/dst";
await generateTestFiles(root, dstDir);

describe("move.overwrite() - scrDir input", async () => {
	//Unexpected input types throw error
	for (const [type, value] of Object.entries(expectedInputType("string"))) {
		it(`scrDir = ${type} throws error`, async () => {
			await expect(dirl.move.overwrite(value, dstDir)).rejects.toThrowError();
		});
	}

	//invalid directory path throws error
	it("scrDir = Invalid directory path throws error", async () => {
		await expect(dirl.move.overwrite(path.join(root, "/tests/"), dstDir)).rejects.toThrowError();
	});

	//invalid absolute path to a directory throws error
	it("scrDir = Invalid absolute path to a directory throws error", async () => {
		await expect(dirl.move.overwrite("/Users/kenny/dev/test", dstDir)).rejects.toThrowError();
	});

	//invalid path to a file throws error
	it("scrDir = Invalid path to a file 'tier1.jpg' throws error", async () => {
		await expect(dirl.move.overwrite("tier1.jpg", dstDir)).rejects.toThrowError();
	});

	//valid path to a file throws error
	it("scrDir = Valid absolute path to a file 'root/tier1.jpg' throws error", async () => {
		await expect(dirl.move.overwrite(path.join(root, "/tier1.jpg"), dstDir)).rejects.toThrowError();
	});

	//invalid absolute path to a file throws error
	it("scrDir = Invalid absolute path to a file throws error", async () => {
		await expect(dirl.move.overwrite(path.resolve(root, "invalidFilePath.jpg"), dstDir)).rejects.toThrowError();
	});

	//valid absolute path to a file throws error
	it("scrDir = Valid absolute path to a file throws error", async () => {
		await expect(dirl.move.overwrite(path.resolve(root, "test.log"), dstDir)).rejects.toThrowError();
	});

	//valid path resolves to truthy value
	it("scrDir = Valid directory path resolves to truthy value", async () => {
		await expect(dirl.move.overwrite(path.join(root, "./relativePathSrc"), dstDir)).resolves.toBeTruthy();
	});

	//valid absolute path
	it("scrDir = Valid absolute path to a directory resolves to truthy value", async () => {
		await expect(dirl.move.overwrite(path.resolve(root, "./absolutePathSrc"), dstDir)).resolves.toBeTruthy();
	});
});

describe("move.overwrite() - dstDir input", async () => {
	//Unexpected input types throw error
	for (const [type, value] of Object.entries(expectedInputType("string"))) {
		it(`dstDir = ${type} throws error`, async () => {
			await expect(dirl.move.overwrite(root, value)).rejects.toThrowError();
		});
	}

	//valid path resolves to truthy value
	it("dstDir = Valid path to a file resolves to truthy value", async () => {
		await expect(
			dirl.move.overwrite(path.join(root, "./relativePathDst"), path.join(dstDir, "/relativePathDst")),
		).resolves.toBeTruthy();
	});

	//valid absolute path resolves to truthy value
	it("dstDir = Valid absolute path to a directory resolves to truthy value", async () => {
		await expect(
			dirl.move.overwrite(path.join(root, "./absolutePathDst"), path.resolve(dstDir, "./absolutePathDst")),
		).resolves.toBeTruthy();
	});
});

describe("move.overwrite() - filter", async () => {
	it("filter = {ext:rar} copies 1 file", async () => {
		const res = await dirl.move.overwrite(root, dstDir, { ext: "rar" });
		expect(res.succeeded).toHaveLength(1);
		expect(res.failed).toHaveLength(0);
	});

	it("filter = {file: tier1} copies 3 files", async () => {
		const res = await dirl.move.overwrite(root, dstDir, { file: "tier1" });
		expect(res.succeeded).toHaveLength(3);
		expect(res.failed).toHaveLength(0);
	});

	it("filter = {dir:empty } copies 2 directories", async () => {
		const res = await dirl.move.overwrite(root, dstDir, { dir: "empty" });
		expect(res.failed).toHaveLength(0);
		expect(fileExists(path.join(dstDir, "empty"))).toBeTruthy();
		expect(fileExists(path.join(dstDir, "empty/secondEmpty"))).toBeTruthy();
	});

	it("filter = {dir:filterTest, file:log} moves 1 file", async () => {
		const res = await dirl.move.overwrite(root, dstDir, { dir: "filterTest", file: "log" });
		expect(fileExists(path.join(dstDir, "filterTest/logs.log"))).toBeTruthy();
	});

	it("filter = {dir:filterTest, ext:png} moves 1 file", async () => {
		const res = await dirl.move.overwrite(root, dstDir, { dir: "filterTest", ext: "png" });
		expect(fileExists(path.join(dstDir, "filterTest/image.png"))).toBeTruthy();
	});

	it("filter = {file:filterTest, ext:wma} moves 1 file", async () => {
		const res = await dirl.move.overwrite(root, dstDir, { file: "audio", ext: "wma" });
		expect(fileExists(path.join(dstDir, "filterTest/audio.wma"))).toBeTruthy();
	});

	it("filter = {file:filterTest, file:zipped, ext:zip} moves 1 file", async () => {
		const res = await dirl.move.overwrite(root, dstDir, { dir: "filterTest", file: "^zip", ext: "zip" });
		expect(fileExists(path.join(dstDir, "filterTest/zipped.zip"))).toBeTruthy();
	});
});

describe("move.overwrite() - all", async () => {
	it("srcDir = dstDir when all files are copied", async () => {
		const res = await dirl.move.overwrite(root, dstDir);
		await expect(fileExists(root)).resolves.toBeFalsy();
	});
});
