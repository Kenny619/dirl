import dir from "../src/index";
import { describe, expect, test } from "vitest";

/*Scenarios

fn: getFilePath 
01. invalid directory path throws 'directory path validation failed'.
02. Valid file path throws 'directory path validation failed'.
03. Non-Existing dir path throws 'directory path validation failed'.
04. /10files returns 10 filePaths
05. Using dirNameFilter=level2 returns 2 filePaths
06. Using dirNameFilter=level9 returns 0 filePaths
07. Using fileNameFilter=5 returns 1 filePath
08. Using fileNameFilter=test returns 0 filePath
09. Using extNameFilter=jpg returns 0 filePath
10. Using extNameFilter=txt returns 10 filePath
11. /empty return 0 filePaths

fn: getFileCount
12. invalid directory path throws 'directory path validation failed'.
13. Valid file path throws 'directory path validation failed'.
14. Non-Existing dir path throws 'directory path validation failed'.
15. /10files returns 10 
16. Using dirNameFilter=level2 returns 2 
17. Using dirNameFilter=level9 returns 0 
18. Using fileNameFilter=5 returns 1 
19. Using fileNameFilter=test returns 0 
20. Using extNameFilter=jpg returns 0 
21. Using extNameFilter=txt returns 10 
22. srcDir=/empty return 0 
*/

describe("Fn: getFilePaths", () => {
	test("01. invalid directory path returns 'directory path validation failed'", async () => {
		const srcDir = "";
		await expect(dir.getFilePaths(srcDir)).rejects.toThrow(/Directory path validation failed/);
	});

	test("02. Valid file path returns 'directory path validation failed'.", async () => {
		const srcDir = "C:\\dev\\sandbox\\tsconfig.json";
		await expect(dir.getFilePaths(srcDir)).rejects.toThrow(/Directory path validation failed/);
	});

	test("03. Non-Existing dir path returns 'directory path validation failed'.", async () => {
		const srcDir = "Z:\\";
		await expect(dir.getFilePaths(srcDir)).rejects.toThrow(/Directory path validation failed/);
	});

	test("04. Valid and existing dir path resolves promise", async () => {
		const srcDir = "C:\\dev\\sandbox\\files\\10files";
		expect(await dir.getFilePaths(srcDir)).toHaveLength(12);
	});

	test("05. Using dirNameFilter=level2 returns 4 filePaths", async () => {
		const srcDir = "C:\\dev\\sandbox\\files\\10files";
		expect(await dir.getFilePaths(srcDir, { dirNameFilter: "level4" })).toHaveLength(6);
	});

	test("06. Using dirNameFilter=level9 returns 0 filePaths", async () => {
		const srcDir = "C:\\dev\\sandbox\\files\\10files";
		expect(await dir.getFilePaths(srcDir, { dirNameFilter: "level9" })).toHaveLength(0);
	});
	test("07. Using fileNameFilter=5 returns 1 filePath", async () => {
		const srcDir = "C:\\dev\\sandbox\\files\\10files";
		expect(await dir.getFilePaths(srcDir, { fileNameFilter: "5" })).toHaveLength(3);
	});
	test("08. Using fileNameFilter=test returns 0 filePath", async () => {
		const srcDir = "C:\\dev\\sandbox\\files\\10files";
		expect(await dir.getFilePaths(srcDir, { fileNameFilter: "test" })).toHaveLength(0);
	});
	test("09. Using extNameFilter=jpg returns 0 filePath", async () => {
		const srcDir = "C:\\dev\\sandbox\\files\\10files";
		expect(await dir.getFilePaths(srcDir, { extNameFilter: "jpg" })).toHaveLength(0);
	});
	test("10. Using extNameFilter=txt returns 12 filePath", async () => {
		const srcDir = "C:\\dev\\sandbox\\files\\10files";
		expect(await dir.getFilePaths(srcDir, { extNameFilter: "txt" })).toHaveLength(12);
	});
	test("11. /empty return 0 filePaths", async () => {
		const srcDir = "C:\\dev\\sandbox\\files\\empty";
		expect(await dir.getFilePaths(srcDir)).toHaveLength(0);
	});
});

describe("Fn: getFileCount", () => {
	test("12. invalid directory path throws 'directory path validation failed'.", async () => {
		const srcDir = "";
		await expect(dir.getFileCount(srcDir)).rejects.toThrow(/Directory path validation failed/);
	});

	test("13. Valid file path throws 'directory path validation failed'.", async () => {
		const srcDir = "C:\\dev\\sandbox\\tsconfig.json";
		await expect(dir.getFileCount(srcDir)).rejects.toThrow(/Directory path validation failed/);
	});

	test("14. Non-Existing dir path throws 'directory path validation failed'.", async () => {
		const srcDir = "Z:\\";
		await expect(dir.getFileCount(srcDir)).rejects.toThrow(/Directory path validation failed/);
	});

	test("15. /10files returns 12", async () => {
		const srcDir = "C:\\dev\\sandbox\\files\\10files";
		expect(await dir.getFileCount(srcDir)).toBe(12);
	});

	test("16. Using dirNameFilter=level4 returns 6", async () => {
		const srcDir = "C:\\dev\\sandbox\\files\\10files";
		expect(await dir.getFileCount(srcDir, { dirNameFilter: "level4" })).toBe(6);
	});

	test("17. Using dirNameFilter=level9 returns 0", async () => {
		const srcDir = "C:\\dev\\sandbox\\files\\10files";
		expect(await dir.getFileCount(srcDir, { dirNameFilter: "level9" })).toBe(0);
	});
	test("18. Using fileNameFilter=5 returns 3", async () => {
		const srcDir = "C:\\dev\\sandbox\\files\\10files";
		expect(await dir.getFileCount(srcDir, { fileNameFilter: "5" })).toBe(3);
	});
	test("19. Using fileNameFilter=test returns 0", async () => {
		const srcDir = "C:\\dev\\sandbox\\files\\10files";
		expect(await dir.getFileCount(srcDir, { fileNameFilter: "test" })).toBe(0);
	});
	test("20. Using extNameFilter=jpg returns 0", async () => {
		const srcDir = "C:\\dev\\sandbox\\files\\10files";
		expect(await dir.getFileCount(srcDir, { extNameFilter: "jpg" })).toBe(0);
	});
	test("21. Using extNameFilter=txt returns 12", async () => {
		const srcDir = "C:\\dev\\sandbox\\files\\10files";
		expect(await dir.getFileCount(srcDir, { extNameFilter: "txt" })).toBe(12);
	});
	test("22. srcDir=/empty return 0", async () => {
		const srcDir = "C:\\dev\\sandbox\\files\\empty";
		expect(await dir.getFileCount(srcDir)).toBe(0);
	});
});
