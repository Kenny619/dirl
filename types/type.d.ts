export type {};
declare global {
	type Mode =
		| "copyOverwrite" // Copy and overwirte same name files exist in destination.
		| "copyDiff" // Only copy files that exist on source, but missing in destination.
		| "copyIfNew" // Copy and overwrite same name files, only if the source file is newer than destination file.
		| "moveOverwrite" // Move and overwrite same name files exist in destination.
		| "moveDiff" // Only move files that exist on source, but missing in destination.
		| "moveIfNew"; // Move and overwrite same name files, only if the source file is newer than destination file.

	type FilterNames = "dir" | "file" | "ext";
	type Filters = Partial<{ [Key in FilterNames]: string }>;
	type RegexFilters = Partial<{ [key in FilterNames]: RegExp }>;

	type ErrorLog = Partial<{ path: string; error: string }[]>;

	type FileSizeGroup = { [Key: number]: string[] };
	type Duplicates = string[][];

	//move.ts
	type TransferFilesResult = {
		files: number;
		moved: number;
		deleted: number | null;
		errors: errorLog;
	};

	type TransferFn = (srcDir: string, dstDir: string, filters: Filters) => Promise<void>;
	type Transfer = {
		overwrite: TransferFn;
		diff: TransferFn;
		ifNew: TransferFn;
	};

	//get.ts
	type GetFn<T> = (rootDir: string, filters: Filters = {}) => Promise<T>;
	type Get = {
		filePaths: GetFn<string[]>;
		dirPaths: GetFn<string[]>;
		fileCount: GetFn<number>;
		fileSizes: GetFn<{ path: string; size: string }[]>;
		dirSizes: GetFn<{ dir: string; size: string }[]>;
		duplicateFiles: GetFn<string[][]>;
	};

	//print.ts
	type PrintFn = (rootDir: string, filters: Filters = {}) => Promise<void>;

	type Print = {
		filePaths: PrintFn;
		dirPaths: PrintFn;
		fileCount: PrintFn;
		fileSizes: PrintFn;
		dirSizes: PrintFn;
		duplicateFiles: PrintFn;
	};

	//flatten.ts
	type FlattenFn = (srcDir: string, dstDir: string, separator = "_", filters: Filters = {}) => Promise<void>;
	type Flatten = {
		all: FlattenFn;
		unique: FlattenFn;
	};

	type Dirl = {
		get: Get;
		copy: Transfer;
		move: Transfer;
		flatten: Flatten;
		print: Print;
	};
}
