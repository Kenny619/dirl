import fsp from "node:fs/promises";
import dirl from "../src/index";
import { describe, expect, test } from "vitest";

/* scenarios
directory
01. Invalid srcDir throws 'not a valid directory' error
2. Invalid dstDir throws 'Failed to write to directory' error

filter
03. Invalid option.dirName throws 'not a valid RegExp' error
04. Invalid option.fileName throws 'not a valid RegExp' error
05. Invalid option.extName throws 'not a valid RegExp' error
06. option.dirNameFilter applicable to all source files copy 0 files
07. option.fileNameFilter applicable to all source files copy 0 files
08. option.extNameFilter applicable to all source files copy 0 files
09. option.fileNameFilter applicable to all source files copy 2 files
10. copyIfNew to copy same 2 files results in no overwrite
11. copyDiff to move rest of the files
*/

describe("Fn: strToRegExp", async () => {
	test("01. Invalid srcDir throws 'not a valid directory' error", async () => {
		const srcDir = "";
		const dstDir = "";
		const option: options = { mode: "copyDiff" };
		await expect(dirl.move(srcDir, dstDir, option)).rejects.toThrow(
			/not a valid directory/,
		);
	});

	test("02. Invalid dstDir throws 'Failed to write to directory...' error", async () => {
		const srcDir = "C:\\dev\\sandbox\\files\\src";
		const dstDir = "I:\\sandbox\\dest";
		const option: options = { mode: "copyDiff" };
		await expect(dirl.move(srcDir, dstDir, option)).rejects.toThrow(
			/Failed to write to directory/i,
		);
	});

	test("03. Invalid option.dirName throws 'not a valid RegExp' error", async () => {
		const srcDir = "C:\\dev\\sandbox\\files\\src";
		const dstDir = "C:\\dev\\sandbox\\files\\dst";
		const option: options = { dirNameFilter: "\\", mode: "copyDiff" };
		await expect(dirl.move(srcDir, dstDir, option)).rejects.toThrow(
			/not a valid RegExp/,
		);
		await fsp.rm(dstDir, { recursive: true, force: true });
	});

	test("04. Invalid option.fileName throws 'not a valid RegExp' error", async () => {
		const srcDir = "C:\\dev\\sandbox\\files\\src";
		const dstDir = "C:\\dev\\sandbox\\files\\dst";
		const option: options = { fileNameFilter: "\\", mode: "copyDiff" };
		await expect(dirl.move(srcDir, dstDir, option)).rejects.toThrow(
			/not a valid RegExp/,
		);
		await fsp.rm(dstDir, { recursive: true, force: true });
	});

	test("05. Invalid option.extName throws 'not a valid RegExp' error. ", async () => {
		const srcDir = "C:\\dev\\sandbox\\files\\src";
		const dstDir = "C:\\dev\\sandbox\\files\\dst";
		const option: options = { extNameFilter: "\\", mode: "copyDiff" };
		await expect(dirl.move(srcDir, dstDir, option)).rejects.toThrow(
			/not a valid RegExp/,
		);
		await fsp.rm(dstDir, { recursive: true, force: true });
	});

	test("06. option.dirNameFilter not applicable to all source files copy 0 files", async () => {
		const srcDir = "C:\\dev\\sandbox\\files\\src";
		const dstDir = "C:\\dev\\sandbox\\files\\dst";
		const option: options = { dirNameFilter: "ABC", mode: "copyOverwrite" };
		try {
			await dirl.move(srcDir, dstDir, option);
		} catch (e) {
			throw new Error(`${e}`);
		}
		await expect(dirl.getFileCount(dstDir)).resolves.toBe(0);
		await fsp.rm(dstDir, { recursive: true, force: true });
	});

	test("07. option.fileNameFilter not applicable to all source files copy 0 files", async () => {
		const srcDir = "C:\\dev\\sandbox\\files\\src";
		const dstDir = "C:\\dev\\sandbox\\files\\dst";
		const option: options = { fileNameFilter: "test", mode: "copyOverwrite" };
		try {
			await dirl.move(srcDir, dstDir, option);
		} catch (e) {
			throw new Error(`${e}`);
		}
		await expect(dirl.getFileCount(dstDir)).resolves.toBe(0);
		await fsp.rm(dstDir, { recursive: true, force: true });
	});

	test("08. option.extNameFilter not applicable to all source files copy 0 files", async () => {
		const srcDir = "C:\\dev\\sandbox\\files\\src";
		const dstDir = "C:\\dev\\sandbox\\files\\dst";
		const option: options = { extNameFilter: "jpg", mode: "copyOverwrite" };
		try {
			await dirl.move(srcDir, dstDir, option);
		} catch (e) {
			throw new Error(`${e}`);
		}
		await expect(dirl.getFileCount(dstDir)).resolves.toBe(0);
		await fsp.rm(dstDir, { recursive: true, force: true });
	});

	test("09. option.fileNameFilter applicable to all source files copy 2 files", async () => {
		const srcDir = "C:\\dev\\sandbox\\files\\src";
		const dstDir = "C:\\dev\\sandbox\\files\\dst";
		const option: options = { fileNameFilter: "level1", mode: "copyOverwrite" };
		try {
			await dirl.move(srcDir, dstDir, option);
		} catch (e) {
			throw new Error(`${e}`);
		}
		await expect(dirl.getFileCount(dstDir)).resolves.toBe(2);
		// await fsp.rm(dstDir, { recursive: true, force: true });
	});

	test("10. copyIfNew to copy same 2 files results in no overwrite", async () => {
		const srcDir = "C:\\dev\\sandbox\\files\\src";
		const dstDir = "C:\\dev\\sandbox\\files\\dst";
		const option: options = { fileNameFilter: "level[12]", mode: "copyIfNew" };
		try {
			await dirl.move(srcDir, dstDir, option);
		} catch (e) {
			throw new Error(`${e}`);
		}
		await expect(dirl.getFileCount(dstDir)).resolves.toBe(4);
		// await fsp.rm(dstDir, { recursive: true, force: true });
	});

	test("11. moveDiff to move all the rest of files from src to dst", async () => {
		const srcDir = "C:\\dev\\sandbox\\files\\src";
		const dstDir = "C:\\dev\\sandbox\\files\\dst";
		const option: options = { mode: "moveDiff" };
		try {
			await dirl.move(srcDir, dstDir, option);
		} catch (e) {
			throw new Error(`${e}`);
		}
		await expect(dirl.getFileCount(dstDir)).resolves.toBe(4);
		// await fsp.rm(dstDir, { recursive: true, force: true });
	});
});
