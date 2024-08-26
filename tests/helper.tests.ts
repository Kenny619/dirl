import path from "node:path";
import fsp from "node:fs/promises";

type InputType =
	| "null"
	| "undefined"
	| "NaN"
	| "string"
	| "emptyString"
	| "number"
	| "zero"
	| "Infinity"
	| "boolean"
	| "array"
	| "emptyArray"
	| "object"
	| "emptyObject"
	| "function"
	| "symbol"
	| "bigint";

export async function compareDir(scrRoot: string, dstRoot: string, dirName = "") {
	const srcDir = dirName ? path.join(scrRoot, dirName) : scrRoot;
	const dstDir = dirName ? path.join(dstRoot, dirName) : dstRoot;
	const srcFiles = await fsp.readdir(srcDir, { recursive: true });
	const dstFiles = await fsp.readdir(dstDir, { recursive: true });
	return srcFiles.join("") === dstFiles.join("");
}

//throw an error when  \, /, :, *, ?, ", <, >, | is used in separator
export function invalidSeparators() {
	return ["\\", "/", ":", "*", "?", '"', "<", ">", "|"];
}

export function validSeparators() {
	return ["_", "-", ".", "===", "@@@@@", "#", ",", "$", ";", "&", "+++", "~"];
}

export function expectedInputType(type: InputType) {
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	const typeValues: Record<InputType, any> = {
		null: null,
		undefined: undefined,
		NaN: Number.NaN,
		string: "string",
		emptyString: "",
		number: 1,
		zero: 0,
		Infinity: Number.POSITIVE_INFINITY,
		boolean: true,
		array: [1, 2, 3],
		emptyArray: [],
		object: { a: 1, b: 2, c: 3 },
		emptyObject: {},
		function: () => {},
		symbol: Symbol(),
		bigint: BigInt(1),
	};

	delete typeValues[type];

	return typeValues;
}

export async function fileExists(path: string) {
	try {
		await fsp.stat(path);
		return true;
	} catch (e) {
		return false;
	}
}

export async function isFileNew(file1: string, file2: string) {
	const stats1 = await fsp.stat(file1);
	const stats2 = await fsp.stat(file2);
	return stats1.mtime.getTime() > stats2.mtime.getTime();
}
