/*

/root/dir1/dir2
/root/dir1/dir25
/root/dir1/dir25/dirh
/root/ext/lib
/root/dir1/dir2/dir3

root
 dir1
  dir2
   dir3
  dir25
   dirh
 ext
  lib   

root
+ dir1
  +dir2
  | +dir3
  +dir25
   -dirh
+ ext
  -lib 



const tree = {
    root: {
        dir1: {dir2: {dir3:{}}, dir25:{dirh:{}}}, ext:{lib:{}}
    }
}
*/

import dirl from "./index";

const root = "./src/tests/";

let dirs = [];
try {
	dirs = await dirl.get.dirPaths(root);
} catch (e) {
	throw `${e}`;
}

const tree = {};

// for(const dir  of dirs){
//     const dirArr = dir.split("/");

// }
console.log(dirs);
