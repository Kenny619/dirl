import { describe, it, expect } from "vitest";
import path from "node:path";
import dirl from "../../src/index";
import { generateTestFiles } from "./get.testFiles";
import { expectedInputType } from "../helper.tests";
//input type
const root = "./tests/testFiles/get/dirPaths/src";
const dstDir = "./tests/testFiles/get/dirPaths/dst";
await generateTestFiles(root, dstDir);

describe("dirpaths() - input", async () => {
	//Unexpected input types throw error
	for (const [type, value] of Object.entries(expectedInputType("string"))) {
		it(`scrDir = ${type} throws error`, async () => {
			await expect(dirl.get.dirPaths(value)).rejects.toThrowError();
		});
	}

	//invalid relative path to a directory throws error
	it("scrDir = Invalid relative path to a directory throws error", async () => {
		await expect(dirl.get.dirPaths(path.join("./test"))).rejects.toThrowError();
	});

	//invalid absolute path to a directory throws error
	it("scrDir = Invalid absolute path to a directory throws error", async () => {
		await expect(dirl.get.dirPaths(path.resolve(root, "./invalid"))).rejects.toThrowError();
	});

	//invalid relative path to a file throws error
	it("scrDir = Invalid relative path to a file throws error", async () => {
		await expect(dirl.get.dirPaths("tier1.log")).rejects.toThrowError();
	});

	//invalid absolute path to a file throws error
	it("scrDir = Invalid absolute path to a file throws error", async () => {
		await expect(dirl.get.dirPaths(path.resolve(root, "./invalidFilePath.jpg"))).rejects.toThrowError();
	});

	//Valid relative path to a file throws error
	it("scrDir = Valid relative path to a file throws error", async () => {
		await expect(dirl.get.dirPaths("./tests/helper.tests.ts")).rejects.toThrowError();
	});

	//Valid absolute path to a file throws error
	it("scrDir = Valid absolute path to a file throws error", async () => {
		await expect(dirl.get.dirPaths(path.resolve(root, "./tier1.log"))).rejects.toThrowError();
	});

	//valid relative path resolves to truthy value
	it("scrDir = Valid relative directory path resolves to truthy value", async () => {
		await expect(dirl.get.dirPaths(path.join(root, "/empty"))).resolves.toBeTruthy();
	});

	//valid relative path
	it("scrDir = Valid absolute path to a directory resolves to truthy value", async () => {
		await expect(dirl.get.dirPaths(path.resolve(root, "./empty"))).resolves.toBeTruthy();
	});
});

describe("dirpaths() - output", async () => {
	it("root returns 6 directories", async () => {
		await expect(dirl.get.dirPaths(root)).resolves.toHaveLength(6);
	});
	it("./root/tier2/ returns 2 directories", async () => {
		await expect(dirl.get.dirPaths(path.join(root, "/tier2"))).resolves.toHaveLength(2);
	});
	it(".root/tier2/tier3/ returns 1 directory", async () => {
		await expect(dirl.get.dirPaths(path.join(root, "/tier2/tier3"))).resolves.toHaveLength(1);
	});
	it(".root/duplicate/ returns 1 directory", async () => {
		await expect(dirl.get.dirPaths(path.join(root, "/duplicate"))).resolves.toHaveLength(1);
	});
	it(".root/empty/ returns 1 directories", async () => {
		await expect(dirl.get.dirPaths(path.join(root, "/empty"))).resolves.toHaveLength(2);
	});
});

describe("dirPaths() - filter", async () => {
	it("undefined filter is ignored and returns 6 paths", async () => {
		await expect(dirl.get.dirPaths(root, undefined)).resolves.toHaveLength(6);
	});
	it("null filter is ignored and returns 6 paths", async () => {
		await expect(dirl.get.dirPaths(root, null)).resolves.toHaveLength(6);
	});
	it("NaN filter is ignored and returns 6 paths", async () => {
		await expect(dirl.get.dirPaths(root, Number.NaN)).resolves.toHaveLength(6);
	});
	it("Empty string filter is ignored", async () => {
		await expect(dirl.get.dirPaths(root, "")).resolves.toHaveLength(6);
	});
	it("Incorrect format filter is ignored and returns 6 paths", async () => {
		await expect(dirl.get.dirPaths(root, [{ dir: "duplicate" }])).resolves.toHaveLength(6);
	});
	it("Invalid RegExp filter throws error", async () => {
		await expect(dirl.get.dirPaths(root, { dir: "\\" })).rejects.toThrowError();
	});
	it("filter {dir: duplicate} returns 1 path", async () => {
		await expect(dirl.get.dirPaths(root, { dir: "duplicate" })).resolves.toHaveLength(1);
	});
	it("filter {dir: tier2 } returns 2 paths ", async () => {
		await expect(dirl.get.dirPaths(root, { dir: "tier2" })).resolves.toHaveLength(2);
	});
	it("filter {dir: dstDir, } returns 0 paths", async () => {
		await expect(dirl.get.dirPaths(root, { dir: "dstDir" })).resolves.toHaveLength(0);
	});
	it("filter {dir: testFiles} returns 6 paths", async () => {
		await expect(dirl.get.dirPaths(root, { dir: "testFiles" })).resolves.toHaveLength(6);
	});
});

describe("dirPaths() - value", async () => {
	it("/empty as the src returns /empty and /empty/secondEmpty", async () => {
		await expect(dirl.get.dirPaths(path.join(root, "/empty"))).resolves.toEqual([
			path.resolve(root, "./empty"),
			path.resolve(root, "./empty/secondEmpty"),
		]);
	});
	it("root with {dir: tier2} returns '.tests/testFiles/get/tier2/' and '.tests/testFiles/get/tier2/tier3/'", async () => {
		await expect(dirl.get.dirPaths(root, { dir: "tier2" })).resolves.toEqual([
			path.resolve(root, "./tier2"),
			path.resolve(root, "./tier2/tier3"),
		]);
	});
});
