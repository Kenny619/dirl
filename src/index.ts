import DirlGet from "./get.js";
import DirlMove from "./move.js";
import DirlFlatten from "./flat.js";
import DirlPrint from "./print.js";

const dirlg = new DirlGet();
const get: Get = dirlg.get;

const dirlm = new DirlMove();
const move: Transfer = dirlm.move;
const copy: Transfer = dirlm.copy;

const dirlf = new DirlFlatten();
const flatten = dirlf.flatten;

const dirlp = new DirlPrint();
const print = dirlp.print;

const dirl: Dirl = {
	get: get,
	copy: copy,
	move: move,
	flatten: flatten,
	print: print,
};

export default dirl;
