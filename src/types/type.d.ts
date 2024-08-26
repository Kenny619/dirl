type ReturnFormat<T> = { result: T; err: null } | { result: null; err: Error };

// filter///////////////////////////////////////////////////////
type FilterKeys = "dir" | "file" | "ext";
type Filters = Partial<{ [Key in FilterKeys]: string }>;
type RegexFilters = Partial<{ [key in FilterKeys]: RegExp }>;

// transfer.ts ///////////////////////////////////////////////////
type Mode =
	| "copyOverwrite" // Copy and overwirte same name files exist in destination.
	| "copyDiff" // Only copy files that exist on source, but missing in destination.
	| "copyIfNew" // Copy and overwrite same name files, only if the source file is newer than destination file.
	| "moveOverwrite" // Move and overwrite same name files exist in destination.
	| "moveDiff" // Only move files that exist on source, but missing in destination.
	| "moveIfNew"; // Move and overwrite same name files, only if the source file is newer than destination file.

type MovableFile = {
	srcFilePath: string;
	dstFilePath: string;
};

type MoveResults = {
	succeeded: { srcFilePath: string; dstFilePath: string }[];
	failed: { srcFilePath: string; dstFilePath: string; err: Error }[];
};
