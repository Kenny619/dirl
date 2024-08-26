



![Dirl](https://raw.githubusercontent.com/Kenny619/dirl/main/src/assets/dirl-logo.png)

## dirl 
`dirl` is a JavaScript library designed to simplify interactions with the local file directory.  It provides straightforward methods for common tasks such as acquiring directory information, moving and copying files, and flattening directory structures.
Less fs, loops, and try/catches.

## Installation
To install `dirl` via npm, run the following command in your project directory:
```bash
npm install dirl
```

## Usage
To use `dirl`, first import it into your JavaScript file:

```js
import dirl from 'dirl';
```

The `dirl` class is instantiated internally with the current working directory, meaning you don't need to create an instance. You can directly access its methods. 

### method groups
dirl consists of 4 main groups of methods: `get`, `move`, `copy`, and `flatten`.

`get`  [Acquires information about the directory tree such as file paths, directory sizes, and duplicate files.](#get-methods)

`move`  [Moves a directory tree from one location to another.](#move-methods)

`copy`  [Copies a directory tree from one location to another.](#copy-methods)

`flatten`  [Copies files residing under a directory tree into a single directory.](#flatten-methods)

### Paths 
Both absolute and relative paths are accepted for the directory parameter.

>[!NOTE]
>If you use relative paths, the current working directory is used as the base path.

### Filters 
`filters` is an optional parameter that allows users to limit the effect of dirl method only to the selected files and directories.  Filtering works by matching the `filters` values against file paths and directory paths underneath the target directory.  Paths that don't match the `filters` values are scoped out of dirl method and only the matching paths are processed.

filters parameter takes the form of following object: `{dir: string, file: string, ext: string}`

`dir` matches against directory path.

`file` matches against filename without its extension.

`ext` matches against file extension, excluding the dot.

>[!TIP]
>You can write regular expressions for `dir`, `file`, and `ext` parameters.  Passed string is converted to regular expression internally.<br><br>
> :white_check_mark: DO `{file: "^test"}`<br>
> :x: DON'T `{file: "/^test/"}`



>[!WARNING]
> When 
`filters` parameters work in AND not OR.  When multiple filters are passed, all filters must match for the path to be included in the result.<br><br>
>EXAMPLE:<br>
>file path: `/my-directory/test.txt`<br><br>
>filters A: `{file: "test", ext: "txt"}`<br>
>result A: path is included in the result because both filters match.<br><br>
>filters B: `{file: "test", ext: "md"}`<br>
>result B: path is not included in the result because not all filters match.

### System Files
System generated files like `.DS_Store` and `Thumbs.db` are excluded from the results by default.  Those files are excluded from count and size calculations and move/copy/flatten operations.



## get methods

### dirl.get.filePaths 
`dirl.get.filePaths(rootDir: string, filters:{dir:string, file:string, ext:string} = {})`

Returns file paths of all files under the root directory.

#### Parameters
`rootDir`: The root directory to search for files.<br>
`filters`: [Filters](#filters) is an object of regular expression strings that match against directory path, filename, and file extension for filtering.<br>
#### Returns
`Promise<string[]>` A promise that resolves to an array of file paths.
  
#### Example
```js
const filePaths = await dirl.get.filePaths('./my-directory');

//filePaths is an array of file paths under ./my-directory
```

### dirl.get.dirPaths
`dirl.get.dirPaths(rootDir: string, filters:{dir:string, file:string, ext:string} = {})`

Returns directory paths of all directories under the root directory.

#### Parameters
`rootDir`: The root directory to search for directories.<br>
`filters`: [Filters](#filters) is an object of regular expression strings that match against directory path, filename, and file extension for filtering.<br>
#### Returns
`Promise<string[]>` A promise that resolves to an array of directory paths.

#### Example
```js
const dirPaths = await dirl.get.dirPaths('./my-directory', {dir: "test"});

//dirPaths is an array of directory paths under ./my-directory which include "test" in their path
```

### dirl.get.fileCount

`dirl.get.fileCount(rootDir: string, filters:{dir:string, file:string, ext:string} = {})`

Returns the number of files under the root directory.

#### Parameters
`rootDir`: The root directory to search for files.<br>
`filters`: [Filters](#filters) is an object of regular expression strings that match against directory path, filename, and file extension for filtering.<br>
#### Returns
`Promise<number>` A promise that resolves to the number of files.

#### Example
```js
const fileCount = await dirl.get.fileCount('./my-directory');
console.log(fileCount); //4 
```

### dirl.get.fileSizes
`dirl.get.fileSizes(rootDir: string, filters:{dir:string, file:string, ext:string} = {}, mode: "int" | "str" = "str")`

Returns the size of files under the root directory.

#### Parameters
`rootDir`: The root directory to search for files.<br>
`filters`: [Filters](#filters) is an object of regular expression strings that match against directory path, filename, and file extension for filtering.<br>
`mode`: Defines the return type of file size property.  "int" returns the file size bytes in numbers.  "str" returns the file size bytes using metric prefixes (KB, MB, GB, etc.).  Default is "str".<br>
#### Returns
`Promise<{path: string, size: string | number}[]>`
  A promise that resolves to an array of objects with file path and size properties.

#### Example
```js
const fileSizes = await dirl.get.fileSizes('./my-directory', {}, 'str');

console.log(fileSizes); 
//[ 
//  { path: './my-directory/test.txt', size: '1.00KB' }
//  { path: './my-directory/subdirectory/readme.md', size: '130.25KB' }
//  { path: './my-directory/subdirectory/hero.png', size: '2.50MB' }
//  { path: './my-directory/subdirectory/backup/readme.md', size: '130.25KB' }
// ]
```

### dirl.get.dirSizes
`dirl.get.dirSizes(rootDir: string, filters: {dir:string, file:string, ext:string} = {}, mode: "int" | "str" = "str")`

Returns the size of directories under the root directory.

#### Parameters
`rootDir`: The root directory to search for directories.<br>
`filters`: [Filters](#filters) is an object of regular expression strings that match against directory path, filename, and file extension for filtering.<br>
`mode`: Defines the return type of file size property.  "int" returns the file size bytes in numbers.  "str" returns the file size bytes using metric prefixes (KB, MB, GB, etc.).  Default is "str".<br>
#### Returns
`Promise<{path: string, size: string | number}[]>`
  A promise that resolves to an array of objects with directory path and size properties.

Example:
```js
const dirSizes = await dirl.get.dirSizes('./my-directory');
console.log(dirSizes);
//[ 
//  { path: './my-directory', size: '1.00KB' }
//  { path: './my-directory/subdirectory', size: '2.51MB' }
//  { path: './my-directory/subdirectory/backup', size: '130.25KB' }
// ]
```

### dirl.get.duplicateFiles
`dirl.get.duplicateFiles(rootDir: string, filters: {dir:string, file:string, ext:string} = {})`

Returns an array of duplicate paths.  If duplicates are found, each element of the array is an array of duplicate file paths.  Returns an empty array if no duplicates are found.

#### Parameters
`rootDir`: The root directory to search for files.<br>
`filters`: [Filters](#filters) is an object of regular expression strings that match against directory path, filename, and file extension for filtering.<br>
#### Returns
`Promise<string[][]>` A promise that resolves to an array of duplicate paths, with each element being an array of duplicate file paths.

Example:
```js
const duplicates = await dirl.get.duplicateFiles('./my-directory');
console.log(duplicates);
//[
//  [
//    './my-directory/subdirectory/backup/readme.md', 
//    './my-directory/subdirectory/readme.md' 
//  ]
//]
```

## move methods

### dirl.move.overwrite
`dirl.move.overwrite(srcDir: string, dstDir: string, filters: {dir:string, file:string, ext:string} = {})`

Moves all the files residing under `srcDir` to `dstDir`.  If a file with the same name already exists in `dstDir`, it will be overwritten.  Source file is deleted once move operation is done successfully.  

#### Parameters
`srcDir`: The source directory.<br>
`dstDir`: The destination directory.<br>
`filters`: [Filters](#filters) is an object of regular expression strings that match against directory path, filename, and file extension for filtering.<br>

#### Returns
`Promise<{result: {succeeded: {srcFilePath: string, dstFilePath: string}[],failed: {srcFilePath: string, dstFilePath: string, err: Error}[]} | null, err: Error | null}>` A promise that resolves to move operation results.

When move operation was processed, its result is logged in `result` property.  If a file is moved successfully then its source path and destination path are stored in `succeeded` array.  If a file was failed to move, then its source path, destination path and error object are stored in `failed` array.  If move operation was failed to run, then `result` property is `null` and `err` property contains the error object.


##### Example
```js
const moveResults = await dirl.move.overwrite('./my-directory', './destination');
console.log(moveResults);
//When successful
//
//{
//  result: { 
//    succeeded: [ 
//      {
//          srcFilePath: '/my-directory/test.txt', 
//          dstFilePath: '/destination/test.txt'
//      },
//      {
//          srcFilePath: '/my-directory/subdirectory/readme.md', 
//          dstFilePath: '/destination/subdirectory/readme.md'
//      },
//      {
//          srcFilePath: '/my-directory/subdirectory/hero.png', 
//          dstFilePath: '/destination/subdirectory/hero.png'
//      },
//      {
//          srcFilePath: '/my-directory/subdirectory/backup/readme.md', 
//          dstFilePath: '/destination/subdirectory/backup/readme.md'
//      }
//    ],
//    failed: [] 
//  },
//  err: null
//}
```

### dirl.move.diff
`dirl.move.diff(srcDir: string, dstDir: string, filters: {dir:string, file:string, ext:string} = {})`

Moves files residing under `srcDir` to `dstDir` only if the source file doesn't exist in `dstDir`.  Source file is deleted once move operation is done successfully.

#### Parameters
`srcDir`: The source directory.<br>
`dstDir`: The destination directory.<br>
`filters`: [Filters](#filters) is an object of regular expression strings that match against directory path, filename, and file extension for filtering.<br>
#### Returns
`Promise<{result: {succeeded: {srcFilePath: string, dstFilePath: string}[],failed: {srcFilePath: string, dstFilePath: string, err: Error}[]} | null, err: Error | null}>` A promise that resolves to move operation results.

When move operation was processed, its result is logged in `result` property.  If a file is moved successfully then its source path and destination path are stored in `succeeded` array.  If a file was failed to move, then its source path, destination path and error object are stored in `failed` array.  If move operation was failed to run, then `result` property is `null` and `err` property contains the error object.

[!NOTE]
>If a file was excluded from the move operation due to existance of a file with the same name in the destination directory, then the file will not be included in the `result`.


#### Example
```js
const moveDiffResults = await dirl.move.diff('./source', './destination');
console.log(moveDiffResults);
//When destination directory didn't have /subdirectory/backup/readme.md  
//
//{
//  result: { 
//    succeeded: [ 
//      {
//          srcFilePath: '/my-directory/subdirectory/backup/readme.md', 
//          dstFilePath: '/destination/subdirectory/backup/readme.md'
//      }
//    ],
//    failed: [] 
//  },
//  err: null
//}
```

### dirl.move.ifNew
`dirl.move.ifNew(srcDir: string, dstDir: string, filters: {dir:string, file:string, ext:string} = {})`

Moves files residing under `srcDir` to `dstDir`.  If files exist in `dstDir`, they are overwritten only when the source file is newer than the destination file.  Source file is deleted once move operation is done successfully.

#### Parameters
`srcDir`: The source directory.<br>
`dstDir`: The destination directory.<br>
`filters`: [Filters](#filters) is an object of regular expression strings that match against directory path, filename, and file extension for filtering.<br>
#### Returns
`Promise<{result: {succeeded: {srcFilePath: string, dstFilePath: string}[],failed: {srcFilePath: string, dstFilePath: string, err: Error}[]} | null, err: Error | null}>` A promise that resolves to the result of move operation.

When move operation was processed, its result is logged in `result` property.  If a file is moved successfully then its source path and destination path are stored in `succeeded` array.  If a file was failed to move, then its source path, destination path and error object are stored in `failed` array.  If move operation was failed to run, then `result` property is `null` and `err` property contains the error object.

[!NOTE]
>If a file was excluded from the move operation due to existance of a newer file with the same name in the destination directory, then the file will not be included in the `result`.

#### Example
```js
const moveIfNewResults = await dirl.move.ifNew('./source', './destination');
console.log(moveIfNewResults);
//When subdirectory/backup/readme.md is newer than destination/subdirectory/backup/readme.md  
//
//{
//  result: { 
//    succeeded: [ 
//      {
//          srcFilePath: '/my-directory/subdirectory/backup/readme.md', 
//          dstFilePath: '/destination/subdirectory/backup/readme.md'
//      }
//    ],
//    failed: [] 
//  },
//  err: null
//}
```

## dirl.copy

### dirl.copy.overwrite
`dirl.copy.overwrite(srcDir: string, dstDir: string, filters: {dir:string, file:string, ext:string} = {})`

Copies all the files residing under `srcDir` to `dstDir`.  If a file with the same name already exists in `dstDir`, it will be overwritten.

#### Parameters
`srcDir`: The source directory.<br>
`dstDir`: The destination directory.<br>
`filters`: [Filters](#filters) is an object of regular expression strings that match against directory path, filename, and file extension for filtering.<br>
#### Returns
`Promise<{result: {succeeded: string[],failed: string[]} | null, err: Error | null}>` A promise that resolves to the result of copy operation.

When move operation was processed, its result is logged in `result` property.  If a file is moved successfully then its source path and destination path are stored in `succeeded` array.  If a file was failed to move, then its source path, destination path and error object are stored in `failed` array.  If move operation was failed to run, then `result` property is `null` and `err` property contains the error object.

Example:
```js
const copyResults = await dirl.copy.overwrite('./source', './destination');
console.log(copyResults);
//When successful
//
//{
//  result: { 
//    succeeded: [ 
//      {
//          srcFilePath: '/my-directory/test.txt', 
//          dstFilePath: '/destination/test.txt'
//      },
//      {
//          srcFilePath: '/my-directory/subdirectory/readme.md', 
//          dstFilePath: '/destination/subdirectory/readme.md'
//      },
//      {
//          srcFilePath: '/my-directory/subdirectory/hero.png', 
//          dstFilePath: '/destination/subdirectory/hero.png'
//      },
//      {
//          srcFilePath: '/my-directory/subdirectory/backup/readme.md', 
//          dstFilePath: '/destination/subdirectory/backup/readme.md'
//      }
//    ],
//    failed: [] 
//  },
//  err: null
//}
```

### dirl.copy.diff
`dirl.copy.diff(srcDir: string, dstDir: string, filters: Filters = {})`

Copies files residing under `srcDir` to `dstDir` only if the source file doesn't exist in `dstDir`.

#### Parameters
`srcDir`: The source directory.<br>
`dstDir`: The destination directory.<br>
`filters`: [Filters](#filters) is an object of regular expression strings that match against directory path, filename, and file extension for filtering.<br>
#### Returns
`Promise<{result: {succeeded: string[],failed: string[]} | null, err: Error | null}>` A promise that resolves to the result of copy operation.

When copy operation was processed, its result is logged in `result` property.  If a file is copied successfully then its source path and destination path are stored in `succeeded` array.  If a file was failed to copy, then its source path, destination path and error object are stored in `failed` array.  If copy operation was failed to run, then `result` property is `null` and `err` property contains the error object.

Example:
```js
const copyDiffResults = await dirl.copy.diff('./source', './destination');
console.log(copyDiffResults);
//When destination directory didn't have /subdirectory/backup/readme.md  
//
//{
//  result: { 
//    succeeded: [ 
//      {
//          srcFilePath: '/my-directory/test.txt', 
//          dstFilePath: '/destination/test.txt'
//      },
//    ],
//    failed: [] 
//  },
//  err: null
//}
```

### dirl.copy.ifNew
`dirl.copy.ifNew(srcDir: string, dstDir: string, filters: Filters = {})`

Copies files residing under `srcDir` to `dstDir`.  If files exist in `dstDir`, they are overwritten only when the source file is newer than the destination file.

#### Parameters
`srcDir`: The source directory.<br>
`dstDir`: The destination directory.<br>
`filters`: [Filters](#filters) is an object of regular expression strings that match against directory path, filename, and file extension for filtering.<br>
#### Returns
`Promise<{result: {succeeded: string[],failed: string[]} | null, err: Error | null}>` A promise that resolves to the result of copy operation.

When copy operation was processed, its result is logged in `result` property.  If a file is copied successfully then its source path and destination path are stored in `succeeded` array.  If a file was failed to copy, then its source path, destination path and error object are stored in `failed` array.  If copy operation was failed to run, then `result` property is `null` and `err` property contains the error object.

Example:
```js
const copyIfNewResults = await dirl.copy.ifNew('./source', './destination');
console.log(copyIfNewResults);
//When /my-direction/text.txt is newer than destination/test.txt
//
//{
//  result: { 
//    succeeded: [ 
//      {
//          srcFilePath: '/my-directory/test.txt', 
//          dstFilePath: '/destination/test.txt'
//      },
//    ],
//    failed: [] 
//  },
//  err: null
//}
```

## flatten methods

### dirl.flatten.all

`dirl.flatten.all(srcDir: string, dstDir: string, separator: string = "_", filters:{dir:string, file:string, ext:string} = {})`

Copies all files residing under `srcDir` directory tree to `dstDir`.  No subdirectories are created in `dstDir`.  Files under subdirectory of `srcDir` will have subdirectory name prepended to their original file name separated by `separator`.

Example:
`/my-directory/subdirectory/backup/readme.md` flatten to `/destination` directory will have file name of `./destination/subdirectory_backup_readme.md`

#### Parameters
`srcDir`: The source directory.<br>
`dstDir`: The destination directory.<br>
`separator`: The separator for flattened names, default is "_" (underscore).<br>
`filters`: [Filters](#filters) is an object of regular expression strings that match against directory path, filename, and file extension for filtering.<br>
#### Returns
`Promise<{result: {succeeded: {srcFilePath: string, dstFilePath: string}[],failed: {srcFilePath: string, dstFilePath: string, err: Error}[]} | null, err: Error | null}>` A promise that resolves to the copy operation results.

When flatten operation was processed, its result is logged in `result` property.  If a file is copied successfully then its source path and destination path are stored in `succeeded` array.  If a file was failed to copy, then its source path, destination path and error object are stored in `failed` array.  If flatten operation was failed to run, then `result` property is `null` and `err` property contains the error object.

Example:
```js
const flattenResults = await dirl.flatten.all('./source', './flattened', '_');
console.log(flattenResults);
//When successful
//
//{
//  result: { 
//    succeeded: [ 
//      {
//          srcFilePath: '/my-directory/test.txt', 
//          dstFilePath: '/flattened/test.txt'
//      },
//      {
//          srcFilePath: '/my-directory/subdirectory/readme.md', 
//          dstFilePath: '/flattened/subdirectory_readme.md'
//      },
//      {
//          srcFilePath: '/my-directory/subdirectory/hero.png', 
//          dstFilePath: '/flattened/subdirectory_hero.png'
//      },
//      {
//          srcFilePath: '/my-directory/subdirectory/backup/readme.md', 
//          dstFilePath: '/flattened/subdirectory_backup_readme.md'
//      },
//    ],
//    failed: [] 
//  },
//  err: null
//}
```

### dirl.flatten.unique
`dirl.flatten.unique(srcDir: string, dstDir: string, separator: string = "_", filters:{dir:string, file:string, ext:string} = {})`

Copies all files residing under `srcDir` directory tree to `dstDir`.  No subdirectories are created in `dstDir`.  Files under subdirectory of `srcDir` will have subdirectory name prepended to their original file name separated by `separator`.  If duplicate files are found under `srcDir`, only the one file from the group of duplicates is copied to `dstDir`.  Making the files in `dstDir` unique.

#### Parameters
`srcDir`: The source directory.<br>
`dstDir`: The destination directory.<br>
`separator`: The separator for flattened names, default is "_" (underscore).<br>
`filters`: [Filters](#filters) is an object of regular expression strings that match against directory path, filename, and file extension for filtering.<br>
#### Returns
`Promise<{result: {succeeded: string[],failed: string[]} | null, err: Error | null}>` A promise that resolves to the copy operation results excluding duplicate files.

When flatten operation was processed, its result is logged in `result` property.  If a file is copied successfully then its source path and destination path are stored in `succeeded` array.  If a file was failed to copy, then its source path, destination path and error object are stored in `failed` array.  If flatten operation was failed to run, then `result` property is `null` and `err` property contains the error object.

Example:
```js
const flattenUniqueResults = await dirl.flatten.unique('./source', './flattened', '_');
console.log(flattenUniqueResults);
//When /my-directory/subdirectory/backup/readme.md is a duplicate of /my-directory/subdirectory/readme.md
//
//{
//  result: { 
//    succeeded: [ 
//      {
//          srcFilePath: '/my-directory/test.txt', 
//          dstFilePath: '/flattened/test.txt'
//      },
//      {
//          srcFilePath: '/my-directory/subdirectory/readme.md', 
//          dstFilePath: '/flattened/subdirectory_readme.md'
//      },
//      {
//          srcFilePath: '/my-directory/subdirectory/hero.png', 
//          dstFilePath: '/flattened/subdirectory_hero.png'
//      },
//    ],
//    failed: [] 
//  },
//  err: null
//}
```
