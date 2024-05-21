import dirl from "../src/index";

const root = "./src/tests/";

let dirs = [];
try {
	dirs = await dirl.get.dirPaths(root);
} catch (e) {
	throw `${e}`;
}

const tree = {};

for (const dir of dirs) {
	const dirArr = dir.split("/");
}
console.log(dirs);
