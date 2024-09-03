import { DirlGet } from "./get.js";
import { DirlMove } from "./move.js";
import { DirlFlatten } from "./flat.js";
import { DirlCopy } from "./copy.js";
import type {
	DirlType,
	DirlGetType,
	DirlMoveType,
	DirlCopyType,
	DirlFlattenType,
} from "./types/type.js";

export const get: DirlGetType = new DirlGet();
export const move: DirlMoveType = new DirlMove();
export const copy: DirlCopyType = new DirlCopy();
export const flatten: DirlFlattenType = new DirlFlatten();

export const dirl: DirlType = {
	get,
	move,
	copy,
	flatten,
};

export * from "./types/type.js";
export default dirl;
