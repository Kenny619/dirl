import { describe, it, expect } from "vitest";
import path from "node:path";
import dirl from "../../src/index";
import { generateTestFiles } from "./get.testFiles";
import { expectedInputType } from "../helper.tests";
//input type
const root = "./tests/testFiles/get/dirSizes/src";
const dstDir = "./tests/testFiles/get/dirSizes/dst";
await generateTestFiles(root, dstDir);

describe("dirSizes() - input", async () => {
	//Unexpected input types throw error
	for (const [type, value] of Object.entries(expectedInputType("string"))) {
		it(`scrDir = ${type} throws error`, async () => {
			await expect(dirl.get.dirSizes(value)).rejects.toThrowError();
		});
	}

	//invalid relative path to a directory throws error
	it("scrDir = Invalid relative path to a directory throws error", async () => {
		await expect(dirl.get.dirSizes(path.join("./test"))).rejects.toThrowError();
	});

	//invalid absolute path to a directory throws error
	it("scrDir = Invalid absolute path to a directory throws error", async () => {
		await expect(dirl.get.dirSizes(path.resolve(root, "./invalid"))).rejects.toThrowError();
	});

	//invalid relative path to a file throws error
	it("scrDir = Invalid relative path to a file throws error", async () => {
		await expect(dirl.get.dirSizes("tier1.log")).rejects.toThrowError();
	});

	//invalid absolute path to a file throws error
	it("scrDir = Invalid absolute path to a file throws error", async () => {
		await expect(dirl.get.dirSizes(path.resolve(root, "./invalidFilePath.jpg"))).rejects.toThrowError();
	});

	//Valid relative path to a file throws error
	it("scrDir = Valid relative path to a file throws error", async () => {
		await expect(dirl.get.dirSizes("./tests/helper.tests.ts")).rejects.toThrowError();
	});

	//Valid absolute path to a file throws error
	it("scrDir = Valid absolute path to a file throws error", async () => {
		await expect(dirl.get.dirSizes(path.resolve(root, "./tier1.log"))).rejects.toThrowError();
	});

	//valid relative path resolves to truthy value
	it("scrDir = Valid relative directory path resolves to truthy value", async () => {
		await expect(dirl.get.dirSizes(path.join(root, "/empty"))).resolves.toBeTruthy();
	});

	//valid relative path
	it("scrDir = Valid absolute path to a directory resolves to truthy value", async () => {
		await expect(dirl.get.dirSizes(path.resolve(root, "./empty"))).resolves.toBeTruthy();
		// expect(await isFileNew(path.join(root, "/absolutePathSrc"), path.join(dstDir, "/absolutePathSrc"))).toBeFalsy();
	});
});

describe("dirSizes() - output", async () => {
	it("./tests/testFiles/get/ returns 5 paths", async () => {
		await expect(dirl.get.dirSizes(root)).resolves.toHaveLength(6);
	});
	it("./tests/testFiles/get/tier2/ returns 2 paths", async () => {
		await expect(dirl.get.dirSizes(path.join(root, "/tier2"))).resolves.toHaveLength(2);
	});
	it("./tests/testFiles/get/tier2/tier3/ returns 1 paths", async () => {
		await expect(dirl.get.dirSizes(path.join(root, "/tier2/tier3"))).resolves.toHaveLength(1);
	});
	it("./tests/testFiles/get/duplicate/ returns 1 paths", async () => {
		await expect(dirl.get.dirSizes(path.join(root, "/duplicate"))).resolves.toHaveLength(1);
	});
	it("./tests/testFiles/get/empty/ returns 1 paths", async () => {
		await expect(dirl.get.dirSizes(path.join(root, "/empty"))).resolves.toHaveLength(2);
	});
});

describe("dirSizes() - filter", async () => {
	it("./tests/testFiles/get/ with {dir:duplicate} returns 1 path", async () => {
		await expect(dirl.get.dirSizes(root, { dir: "duplicate" })).resolves.toHaveLength(1);
	});
	it("./tests/testFiles/get/ with {dir:tier2} returns 2 paths", async () => {
		await expect(dirl.get.dirSizes(root, { dir: "tier2" })).resolves.toHaveLength(2);
	});
	it("./tests/testFiles/get/ with {ext: log} returns 5 paths", async () => {
		await expect(dirl.get.dirSizes(root, { ext: "log" })).resolves.toHaveLength(4);
	});
	it("./tests/testFiles/get/ with {dir: tier2, file: tier3} returns 2 files", async () => {
		await expect(dirl.get.dirSizes(root, { dir: "tier2", file: "tier3" })).resolves.toHaveLength(2);
	});
	it("./tests/testFiles/get/ with {dir: tier2, ext: jpg} returns 2 paths", async () => {
		await expect(dirl.get.dirSizes(root, { dir: "tier2", ext: "png" })).resolves.toHaveLength(2);
	});
	it("./tests/testFiles/get/ with {dir: tier2, file:3 ext: png} returns 2 paths", async () => {
		await expect(dirl.get.dirSizes(root, { dir: "tier2", file: "3", ext: "png" })).resolves.toHaveLength(2);
	});
});

describe("dirSizes() - value", async () => {
	it("./tests/testFiles/get/empty returns an empty array", async () => {
		const res = await dirl.get.dirSizes(path.join(root, "/empty"), {});
		expect(res[0].size).toStrictEqual("0.00B ");
	});

	it("./tests/testFiles/get/ with {dir: tier2, file:3 ext: png} returns size:2KB", async () => {
		const res = await dirl.get.dirSizes(root, { dir: "tier2", file: "3", ext: "png" });
		expect(res).toEqual([
			{ path: path.resolve(root, "./tier2"), size: "2.00KB" },
			{ path: path.resolve(root, "./tier2/tier3"), size: "2.00KB" },
		]);
	});
	it("./tests/testFiles/get/ with {dir: tier2} returns size:['12.00KB', '6.00KB']", async () => {
		const res = await dirl.get.dirSizes(root, { dir: "tier2" }, "str");
		expect(res.map((r) => r.size)).toEqual(["12.00KB", "6.00KB"]);
	});
});
