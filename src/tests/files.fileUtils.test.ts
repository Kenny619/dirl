import * as fUtil from "../utils/fileUtils.js";
import { describe, expect, test } from "vitest";

/*Scenarios

fn: validateDirectoryPath
01. invalid directory path throws 'directory path validation failed'.
02. Valid file path throws 'directory path validation failed'.
03. Non-Existing dir path throws 'directory path validation failed'.
04. Valid and existing dir path resolves promise

fn: validateFilePath
05. empty filePath throws 'File path validation Failed'
06. Valid directory path throws 'File path validation Failed'
07. Invalid filePath throws 'File path validation Failed'
08. Non-Existing filePath throws 'File path validation Failed'
09. Valid and eixting file path resovles promise
10. Valid file name starting with . resolves promise

fn: optionFilter
11. option with only "mode" property returns true
12. option with non Regexp dirNameFilter throws 'is not a valid Regexp' error
13. option with non Regexp fileNameFilter throws 'is not a valid Regexp' error
14. option with non Regexp extNameFilter throws 'is not a valid Regexp' error
15. option with valid dirNameFilter and invalid fileNameFilter returns false
16. option with valid dirNameFilter and invalid extNameFilter returns false
17. option with valid fileNameFilter and invalid dirNameFilter returns false
18. option with valid fileNameFilter and invalid extNameFilter returns false
19. option with valid extNameFilter and invalid dirNameFilter returns false
20. option with valid extNameFilter and invalid fileNameFilter returns false
21. option with all invalid Filter returns false
22. option with all valid Filter returns truek 
*/

describe("Fn: validateDirectoryPath", () => {
	test("01. invalid directory path returns 'directory path validation failed'", async () => {
		const srcDir = "";
		await expect(fUtil.validateDirectoryPath(srcDir)).rejects.toThrow(/Directory path validation failed/);
	});

	test("02. Valid file path returns 'directory path validation failed'.", async () => {
		const srcDir = "C:\\dev\\sandbox\\tsconfig.json";
		await expect(fUtil.validateDirectoryPath(srcDir)).rejects.toThrow(/Directory path validation failed/);
	});

	test("03. Non-Existing dir path returns 'directory path validation failed'.", async () => {
		const srcDir = "Z:\\";
		await expect(fUtil.validateDirectoryPath(srcDir)).rejects.toThrow(/Directory path validation failed/);
	});

	test("04. Valid and existing dir path resolves promise", async () => {
		const srcDir = "C:\\";
		await expect(fUtil.validateDirectoryPath(srcDir)).resolves;
	});
});

describe("Fn: validateFilePath", () => {
	test("05. empty filePath throws 'File path validation Failed'", async () => {
		const srcDir = "";
		await expect(fUtil.validateFilePath(srcDir)).rejects.toThrow(/File path validation failed/);
	});

	test("06. Valid directory path throws 'File path validation Failed'", async () => {
		const srcDir = "C:\\";
		await expect(fUtil.validateFilePath(srcDir)).rejects.toThrow(/File path validation failed/);
	});

	test("07. Invalid filePath throws 'File path validation Failed'", async () => {
		const srcDir = "C:dev";
		await expect(fUtil.validateFilePath(srcDir)).rejects.toThrow(/File path validation failed/);
	});

	test("08. Non-Existing filePath throws 'File path validation Failed'", async () => {
		const srcDir = "Z:\\dev\\file.json";
		await expect(fUtil.validateFilePath(srcDir)).rejects.toThrow(/File path validation failed/);
	});

	test("09. Valid and eixting file path resovles promise'", async () => {
		const srcDir = "C:\\dev\\sandbox\\tsconfig.json";
		expect(fUtil.validateFilePath(srcDir)).resolves;
	});

	test("10. Valid file name starting with . resolves promise", async () => {
		const srcDir = "C:\\dev\\sandbox\\.env";
		expect(fUtil.validateFilePath(srcDir)).resolves;
	});
});
/*
12. option with non Regexp dirNameFilter throws 'is not a valid Regexp' error
13. option with non Regexp fileNameFilter throws 'is not a valid Regexp' error
14. option with non Regexp extNameFilter throws 'is not a valid Regexp' error
15. option with valid dirNameFilter and invalid fileNameFilter returns false
16. option with valid dirNameFilter and invalid extNameFilter returns false
17. option with valid fileNameFilter and invalid dirNameFilter returns false
18. option with valid fileNameFilter and invalid extNameFilter returns false
19. option with valid extNameFilter and invalid dirNameFilter returns false
20. option with valid extNameFilter and invalid fileNameFilter returns false
21. option with all invalid Filter returns false
22. option with all valid Filter returns truek 
*/

describe("Fn: createRegexFilters", () => {
	test("11. option with only 'mode' property returns true", async () => {
		const option: options = { mode: "copyDiff" };
		const filter = fUtil.createRegexFilters(option);
		const srcDir = "C:\\dev\\sandbox\\files\\src\\exclude-level1.txt";
		expect(await fUtil.optionFilter(srcDir, filter)).toBe(true);
	});

	test("12. option with non Regexp dirNameFilter throws 'is not a valid Regexp' error", () => {
		const option: options = { mode: "copyDiff", fileNameFilter: "\\" };
		const srcDir = "C:\\dev\\sandbox\\files\\src\\exclude-level1.txt";
		expect(() => fUtil.createRegexFilters(option)).toThrowError(/is not a valid RegExp/);
		//await expect(fUtil.optionFilter(srcDir, filter)).rejects.toThrow( //);
	});

	test("13. option with non Regexp fileNameFilter throws 'is not a valid Regexp' error", () => {
		const option: options = { mode: "copyDiff", fileNameFilter: "/\\" };
		const srcDir = "C:\\dev\\sandbox\\files\\src\\exclude-level1.txt";
		expect(() => fUtil.createRegexFilters(option)).toThrowError(/is not a valid RegExp/);
		//expect(fUtil.optionFilter(srcDir, filter)).rejects.toThrow(/is not a valid RegExp/);
	});

	test("14. option with non Regexp extNameFilter throws 'is not a valid Regexp' error", () => {
		const option: options = { mode: "copyDiff", extNameFilter: "\\" };
		const srcDir = "C:\\dev\\sandbox\\files\\src\\exclude-level1.txt";
		expect(() => fUtil.createRegexFilters(option)).toThrowError(/is not a valid RegExp/);
		//await expect(fUtil.optionFilter(srcDir, filter)).rejects.toThrow(/is not a valid RegExp/);
	});

	test("15. option with valid dirNameFilter and invalid fileNameFilter returns false", async () => {
		const option: options = {
			mode: "copyDiff",
			dirNameFilter: "src",
			fileNameFilter: "include",
		};
		const filter = fUtil.createRegexFilters(option);
		const srcDir = "C:\\dev\\sandbox\\files\\src\\exclude-level1.txt";
		expect(await fUtil.optionFilter(srcDir, filter)).toBe(false);
	});
	test("16. option with valid dirNameFilter and invalid extNameFilter returns false", async () => {
		const option: options = {
			mode: "copyDiff",
			dirNameFilter: "dev",
			extNameFilter: "jpg",
		};
		const filter = fUtil.createRegexFilters(option);
		const srcDir = "C:\\dev\\sandbox\\files\\src\\exclude-level1.txt";
		expect(await fUtil.optionFilter(srcDir, filter)).toBe(false);
	});
	test("17. option with valid fileNameFilter and invalid dirNameFilter returns false", async () => {
		const option: options = {
			mode: "copyDiff",
			fileNameFilter: "-",
			dirNameFilter: "D:",
		};
		const filter = fUtil.createRegexFilters(option);
		const srcDir = "C:\\dev\\sandbox\\files\\src\\exclude-level1.txt";
		expect(await fUtil.optionFilter(srcDir, filter)).toBe(false);
	});
	test("18. option with valid fileNameFilter and invalid extNameFilter returns false", async () => {
		const option: options = {
			mode: "copyDiff",
			fileNameFilter: "level1",
			extNameFilter: "jpg",
		};
		const filter = fUtil.createRegexFilters(option);
		const srcDir = "C:\\dev\\sandbox\\files\\src\\exclude-level1.txt";
		expect(await fUtil.optionFilter(srcDir, filter)).toBe(false);
	});
	test("19. option with valid extNameFilter and invalid dirNameFilter returns false", async () => {
		const option: options = {
			mode: "copyDiff",
			extNameFilter: "txt",
			dirNameFilter: "document\\files",
		};
		const filter = fUtil.createRegexFilters(option);
		const srcDir = "C:\\dev\\sandbox\\files\\src\\exclude-level1.txt";
		expect(await fUtil.optionFilter(srcDir, filter)).toBe(false);
	});
	test("20. option with valid extNameFilter and invalid fileNameFilter returns false", async () => {
		const option: options = {
			mode: "copyDiff",
			extNameFilter: "txt|text",
			fileNameFilter: "level3",
		};
		const filter = fUtil.createRegexFilters(option);
		const srcDir = "C:\\dev\\sandbox\\files\\src\\exclude-level1.txt";
		expect(await fUtil.optionFilter(srcDir, filter)).toBe(false);
	});
	test("21. option with all invalid Filter returns false", async () => {
		const option: options = {
			mode: "copyDiff",
			extNameFilter: "png",
			fileNameFilter: "level3",
			dirNameFilter: "D:",
		};
		const filter = fUtil.createRegexFilters(option);
		const srcDir = "C:\\dev\\sandbox\\files\\src\\exclude-level1.txt";
		expect(await fUtil.optionFilter(srcDir, filter)).toBe(false);
	});
	test("22. option with all valid Filter returns true", async () => {
		const option: options = {
			mode: "copyDiff",
			extNameFilter: "txt",
			fileNameFilter: "level1",
			dirNameFilter: "dev",
		};
		const srcDir = "C:\\dev\\sandbox\\files\\src\\exclude-level1.txt";
		const filter = fUtil.createRegexFilters(option);
		expect(await fUtil.optionFilter(srcDir, filter)).toBe(true);
	});
});
/*
23. SrcFilePath = dstFilePath rejects and throws an error 
24. Invalid srcFilePath throws an error
25. Invalid dstFileFPath throws an error
26. mode=copyOverwrite returns true when a valid dstFilePath doesn't exist
27. mode=copyOverwrite returns true when a valid dstFilePath exists
28. mode=moveOverwrite returns true when a valid dstFilePath doesn't exist
29. mode=moveOverwrite returns true when a valid dstFilePath exists
30. mode=copyDiff returns true when a valid dstFilePath does not exist
31. mode=copyDiff returns false when a valid dstFilePath exists
32. mode=moveDiff returns true when a valid dstFilePath doest not exist
33. mode=moveDiff returns false when a valid dstFilePath exists
34. mode=copyIfNew returns true when srcFilepath is newer than dstFilePath
35. mode=copyIfNew returns false when dstFilepath is newer than srcFilePath
36. mode=moveIfNew returns true when srcFilepath is newer than dstFilePath
37. mode=moveIfNew returns false when dstFilepath is newer than srcFilePath
*/

describe("Fn: isFileMovable", () => {
	test("23. option with only 'mode' property returns true", async () => {
		const srcFilePath = "C:\\dev\\sandbox\\files\\src\\exclude-level1.txt";
		const dstFilePath = "C:\\dev\\sandbox\\files\\src\\exclude-level1.txt";
		const mode = "copyOverwrite";
		await expect(fUtil.isFileMovable(srcFilePath, dstFilePath, mode)).rejects.toThrow(/same file/);
	});

	test("24. Invalid srcFilePath throws an error", async () => {
		const srcFilePath = "";
		const dstFilePath = "C:\\dev\\sandbox\\files\\src\\exclude-level1.txt";
		const mode = "copyOverwrite";
		await expect(fUtil.isFileMovable(srcFilePath, dstFilePath, mode)).rejects.toThrow(/File path validation failed/);
	});
	test("25. Non-Existing dstFileFPath throws an ENOENT error", async () => {
		const srcFilePath = "C:\\dev\\sandbox\\files\\src\\exclude-level1.txt";
		const dstFilePath = "Z:\\dev\\file.txt";
		const mode = "copyOverwrite";
		await expect(fUtil.isFileMovable(srcFilePath, dstFilePath, mode)).rejects.toThrow(/ENOENT/);
	});

	test("26. mode=copyOverwrite returns true when a valid dstFilePath doesn't exist", async () => {
		const srcFilePath = "C:\\dev\\sandbox\\files\\src\\exclude-level1.txt";
		const dstFilePath = "C:\\dev\\sandbox\\filesUtils-test-26";
		const mode = "copyOverwrite";
		await expect(fUtil.isFileMovable(srcFilePath, dstFilePath, mode)).resolves.toBe(true);
	});

	test("27. mode=copyOverwrite returns true when a valid dstFilePath exists", async () => {
		const srcFilePath = "C:\\dev\\sandbox\\files\\src\\exclude-level1.txt";
		const dstFilePath = "C:\\dev\\sandbox\\filesUtils-test-26";
		const mode = "copyOverwrite";
		await expect(fUtil.isFileMovable(srcFilePath, dstFilePath, mode)).resolves.toBe(true);
	});
	test("28. mode=moveOverwrite returns true when a valid dstFilePath doesn't exist", async () => {
		const srcFilePath = "C:\\dev\\sandbox\\files\\src\\exclude-level1.txt";
		const dstFilePath = "C:\\dev\\sandbox\\filesUtils-test-26";
		const mode = "moveOverwrite";
		await expect(fUtil.isFileMovable(srcFilePath, dstFilePath, mode)).resolves.toBe(true);
	});
	test("29. mode=moveOverwrite returns true when a valid dstFilePath exists", async () => {
		const srcFilePath = "C:\\dev\\sandbox\\files\\src\\exclude-level1.txt";
		const dstFilePath = "C:\\dev\\sandbox\\filesUtils-test-26";
		const mode = "moveOverwrite";
		await expect(fUtil.isFileMovable(srcFilePath, dstFilePath, mode)).resolves.toBe(true);
	});
	test("30. mode=copyDiff returns true when a valid dstFilePath does not exist", async () => {
		const srcFilePath = "C:\\dev\\sandbox\\files\\src\\exclude-level1.txt";
		const dstFilePath = "C:\\dev\\sandbox\\filesUtils-test-27";
		const mode = "copyDiff";
		await expect(fUtil.isFileMovable(srcFilePath, dstFilePath, mode)).resolves.toBe(true);
	});
	test("31. mode=copyDiff returns false when a valid dstFilePath exists", async () => {
		const srcFilePath = "C:\\dev\\sandbox\\files\\src\\exclude-level1.txt";
		const dstFilePath = "C:\\dev\\sandbox\\filesUtils-test-27";
		const mode = "copyDiff";
		await expect(fUtil.isFileMovable(srcFilePath, dstFilePath, mode)).resolves.toBe(true);
	});
	test("32. mode=moveDiff returns true when a valid dstFilePath doest not exist", async () => {
		const srcFilePath = "C:\\dev\\sandbox\\files\\src\\exclude-level1.txt";
		const dstFilePath = "C:\\dev\\sandbox\\filesUtils-test-28";
		const mode = "moveDiff";
		await expect(fUtil.isFileMovable(srcFilePath, dstFilePath, mode)).resolves.toBe(true);
	});
	test("33. mode=moveDiff returns false when a valid dstFilePath exists", async () => {
		const srcFilePath = "C:\\dev\\sandbox\\files\\src\\exclude-level1.txt";
		const dstFilePath = "C:\\dev\\sandbox\\filesUtils-test-28";
		const mode = "moveDiff";
		await expect(fUtil.isFileMovable(srcFilePath, dstFilePath, mode)).resolves.toBe(true);
	});
	test("34. mode=copyIfNew returns true when srcFilepath is newer than dstFilePath", async () => {
		const srcFilePath = "C:\\dev\\sandbox\\files\\src\\34.txt";
		const dstFilePath = "C:\\dev\\sandbox\\files\\dst\\34.txt";
		const mode = "copyIfNew";
		await expect(fUtil.isFileMovable(srcFilePath, dstFilePath, mode)).resolves.toBe(true);
	});
	test("35. mode=copyIfNew returns false when dstFilepath is newer than srcFilePath", async () => {
		const srcFilePath = "C:\\dev\\sandbox\\files\\src\\include-level1.txt";
		const dstFilePath = "C:\\dev\\sandbox\\files\\dst\\include-level1.txt";
		const mode = "copyIfNew";
		await expect(fUtil.isFileMovable(srcFilePath, dstFilePath, mode)).resolves.toBe(false);
	});
	test("36. mode=moveIfNew returns false when dstFilepath is newer than srcFilePath", async () => {
		const srcFilePath = "C:\\dev\\sandbox\\files\\src\\include-level1.txt";
		const dstFilePath = "C:\\dev\\sandbox\\files\\dst\\include-level1.txt";
		const mode = "moveIfNew";
		await expect(fUtil.isFileMovable(srcFilePath, dstFilePath, mode)).resolves.toBe(false);
	});
	test("37. mode=moveIfNew returns true when srcFilepath is newer than dstFilePath", async () => {
		const srcFilePath = "C:\\dev\\sandbox\\files\\src\\old.txt";
		const dstFilePath = "C:\\dev\\sandbox\\files\\dst\\old.txt";
		const mode = "moveIfNew";
		await expect(fUtil.isFileMovable(srcFilePath, dstFilePath, mode)).resolves.toBe(true);
	});
});
