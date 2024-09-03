declare module "@kenny619/dirl" {
	export type ReturnFormat<T> =
		| { result: T; err: null }
		| { result: null; err: Error };

	// filter///////////////////////////////////////////////////////
	export type FilterKeys = "dir" | "file" | "ext";
	export type Filters = Partial<{ [Key in FilterKeys]: string }>;
	export type RegexFilters = Partial<{ [key in FilterKeys]: RegExp }>;

	// transfer.ts ///////////////////////////////////////////////////
	export type Mode =
		| "copyOverwrite" // Copy and overwirte same name files exist in destination.
		| "copyDiff" // Only copy files that exist on source, but missing in destination.
		| "copyIfNew" // Copy and overwrite same name files, only if the source file is newer than destination file.
		| "moveOverwrite" // Move and overwrite same name files exist in destination.
		| "moveDiff" // Only move files that exist on source, but missing in destination.
		| "moveIfNew"; // Move and overwrite same name files, only if the source file is newer than destination file.

	export type MovableFile = {
		srcFilePath: string;
		dstFilePath: string;
	};

	export type MoveResults = {
		succeeded: { srcFilePath: string; dstFilePath: string }[];
		failed: { srcFilePath: string; dstFilePath: string; err: Error }[];
	};

	export type DirlGetType = {
		filePaths: (rootDir: string, filters?: Filters) => Promise<string[]>;
		dirPaths: (rootDir: string, filters?: Filters) => Promise<string[]>;
		fileCount: (rootDir: string, filters?: Filters) => Promise<number>;
		dirCount: (rootDir: string, filters?: Filters) => Promise<number>;
		fileSizes: (
			rootDir: string,
			filters?: Filters,
			mode?: "int" | "str",
		) => Promise<{ path: string; size: string | number }[]>;
		dirSizes: (
			rootDir: string,
			filters?: Filters,
			mode?: "int" | "str",
		) => Promise<{ path: string; size: string | number }[]>;
		duplicateFiles: (rootDir: string, filters?: Filters) => Promise<string[][]>;
	};
	export type DirlMoveType = {
		overwrite: (
			srcDir: string,
			dstDir: string,
			filters: Filters,
		) => Promise<MoveResults>;
		diff: (
			srcDir: string,
			dstDir: string,
			filters: Filters,
		) => Promise<MoveResults>;
		ifNew: (
			srcDir: string,
			dstDir: string,
			filters: Filters,
		) => Promise<MoveResults>;
	};
	export type DirlCopyType = {
		overwrite: (
			srcDir: string,
			dstDir: string,
			filters: Filters,
		) => Promise<MoveResults>;
		diff: (
			srcDir: string,
			dstDir: string,
			filters: Filters,
		) => Promise<MoveResults>;
		ifNew: (
			srcDir: string,
			dstDir: string,
			filters: Filters,
		) => Promise<MoveResults>;
	};
	export type DirlFlattenType = {
		all: (
			srcDir: string,
			dstDir: string,
			separator: string,
			filters: Filters,
		) => Promise<MoveResults>;
		unique: (
			srcDir: string,
			dstDir: string,
			separator: string,
			filters: Filters,
		) => Promise<MoveResults>;
	};
	export type DirlType = {
		get: DirlGetType;
		move: DirlMoveType;
		copy: DirlCopyType;
		flatten: DirlFlattenType;
	};
}