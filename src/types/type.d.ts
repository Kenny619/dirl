export type {};
declare global {
	/////////////////////////////////////files

	/**
	 * mode controls
	 * 1) whether to copy files or move(cut&paste) files
	 * 2) the behavior when a source file already exists in the destination
	 */
	type mode =
		| "copyOverwrite" // Copy and overwirte same name files exist in destination.
		| "copyDiff" // Only copy files that exist on source, but missing in destination.
		| "copyIfNew" // Copy and overwrite same name files, only if the source file is newer than destination file.
		| "moveOverwrite" // Move and overwrite same name files exist in destination.
		| "moveDiff" // Only move files that exist on source, but missing in destination.
		| "moveIfNew"; // Move and overwrite same name files, only if the source file is newer than destination file.

	/**
	 * User can specify regular expression filters in the 'options' argument.
	 * If filters are provided, copy/move operations will only apply to files matching the filter(s).
	 * If multiple filters are provided, they will be combined (AND, not OR).
	 * Only files matching all filters will be copied or moved.
	 */

	type FilterNames = "dirNameFilter" | "fileNameFilter" | "extNameFilter";
	//	type inputOption = Partial<Record<FilterNames, string | null>> & { mode: mode };
	//	type regexpOption = Partial<Record<FilterNames, RegExp | null>> & { mode: mode };

	// biome-ignore lint/suspicious/noExplicitAny: <to cover any additional property>
	type options = Partial<
		{ [key in FilterNames]: string } & { mode: mode } & { [K: string]: any }
	>;
	type regexFilters = Partial<{ [key in FilterNames]: RegExp }>;
}
