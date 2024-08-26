import DirlGet from "./get.js";
import DirlMove from "./move.js";
import DirlFlatten from "./flat.js";
import DirlCopy from "./copy.js";

const get = new DirlGet();
const move = new DirlMove();
const copy = new DirlCopy();
const flatten = new DirlFlatten();

const dirl = {
	get,
	move,
	copy,
	flatten,
};

export default dirl;
