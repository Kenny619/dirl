import { DirlGet } from "./get.js";
import { DirlMove } from "./move.js";
import { DirlFlatten } from "./flat.js";
import { DirlCopy } from "./copy.js";
export const get = new DirlGet();
export const move = new DirlMove();
export const copy = new DirlCopy();
export const flatten = new DirlFlatten();
export const dirl = {
    get,
    move,
    copy,
    flatten,
};
export * from "./types/type.js";
export default dirl;
