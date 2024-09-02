import fsp from "node:fs/promises";
import path from "node:path";
import { getPaths } from "./base.js";
import { validateSrcDir } from "./validation.js";
/**
 * Returns a list of file sizes under the root directory. Returns an empty array if the directory tree had no files.
 * @param {string} rootDir - The root directory to search for files.
 * @param {Filters} filters - {dir: string, file: string, ext: string}  Strings of Regular Expressions that match against direrctory path, filename, and file extension for filtering in the file paths.   If multiple properties are specified, all properties must match for the file to pass the filter.
 * @param {"int" | "str"} mode - "int" or "str"  "int" returns the file size in bytes and "str" returns the file size using metric prefixes (kB, MB, GB, etc.).  Default is "str".
 * @returns A promise that resolves to an array of file sizes.
 */
export const getFileSizes = async (rootDir, filters = {}, mode = "str") => {
    try {
        const { data: filePaths, err } = await getPaths(rootDir, "file", filters);
        if (err !== null)
            throw err;
        //run stat() on each file path and return an array of file sizes
        //convert file size in metric prefixes if mode is "str"
        const data = await Promise.all(filePaths.map(async (file) => {
            const stats = await fsp.stat(file);
            return { path: file, size: mode === "str" ? formatFileSizeInBytes(stats.size) : stats.size };
        }));
        return { data: data, err: null };
    }
    catch (e) {
        return { data: null, err: e };
    }
};
/**
 * Returns a list of directory sizes under the root directory.
 * @param {string} rootDir - The root directory to search for directories.
 * @param {Filters} filters - {dir: string, file: string, ext: string}  Strings of Regular Expressions that match against direrctory path, filename, and file extension for filtering in the file paths.   If multiple properties are specified, all properties must match for the file to pass the filter.
 * @param {"int" | "str"} mode - "int" or "str"  "int" returns the directory size in bytes and "str" returns the directory size using metric prefixes (kB, MB, GB, etc.).  Default is "str".
 * @returns {dir: string, size: string | number}[] A promise that resolves to an array of objects with directory path and size properties.
 */
export const getDirSizes = async (rootDir, filters = {}, mode = "str") => {
    //get file sizes of all files under the root dir
    //fileSizes = { path: string; size: number }[]
    const { data: fileSizes, err } = await getFileSizes(rootDir, filters, "int");
    if (err !== null)
        throw err;
    //get a list of all directories under the root dir
    const { data: dirs, err: errGetDirs } = await getPaths(rootDir, "dir", filters);
    if (errGetDirs !== null)
        throw errGetDirs;
    //create initial value for dirSizes which takes directories as key and sets the value to 0
    const dirSizesInit = dirs.reduce((acc, dir) => {
        acc[dir] = 0;
        return acc;
    }, {});
    //sum the file sizes by directory
    //store the result in an object {[directory path: string]: number} where number is the sum of file sizes in bytes
    const dirSizes = fileSizes.reduce((acc, file) => {
        const dir = path.dirname(file.path);
        acc[dir] = (acc[dir] || 0) + file.size;
        return acc;
    }, dirSizesInit);
    //Recursively add sum of subdirectory size sum to its parent directory
    //In the following example, the size of directory C, with no subdirectories, is 50KB.
    //Directory C is a subdirectory of directory B.  The size of directory B itself is 200KB, but adding the size of its subdirectory C, which is 50KB, makes 250KB.
    //The size of root directory A is 350KB by adding up the size of all its subdirectories.
    // directory A
    // ├── directory B
    // │   ├── directory C
    // │   │   └── file (size 50KB)
    // │   └── file (size 200KB)
    // └── file (size 100KB)
    for (const dir in dirSizes) {
        for (const subDir in dirSizes) {
            if (dir !== subDir && subDir.startsWith(dir))
                dirSizes[dir] += dirSizes[subDir];
        }
    }
    return {
        data: Object.keys(dirSizes).map((dir) => {
            return { path: dir, size: mode === "str" ? formatFileSizeInBytes(dirSizes[dir]) : dirSizes[dir] };
        }),
        err: null,
    };
};
/**
 * Formats a file size in bytes to a string using metric prefixes (kB, MB, GB, etc.).
 * @param {number} bytes - The file size in bytes.
 * @returns {string} The file size in bytes with metric prefixes.
 */
const formatFileSizeInBytes = (bytes) => {
    const units = ["B ", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB", "RB", "QB"];
    let i = 0;
    let b = bytes;
    while (b >= 1024 && i < units.length - 1) {
        b /= 1024;
        i++;
    }
    return `${b.toFixed(2)}${units[i]}`;
};
/**
 * Groups file paths by their sizes.
 * @private
 * @param {string} rootDir - The root directory to search for files.
 * @param {Filters} filters - {dir: string, file: string, ext: string}  "dir" and "file" filters are checked against the directory and file name respectively.  "ext" filter is checked against the file extension.  If multiple properties are specified, all properties must match for the file to pass the filter.
 * @returns {size: number, paths: string[]}[] A promise that resolves to an array of objects with size and file paths properties.
 */
const groupFilesBySize = async (rootDir, filters = {}) => {
    //get file sizes
    const { data: fileSizes, err } = await getFileSizes(rootDir, filters, "int");
    if (err !== null)
        throw err;
    //group file path by file sizes
    //return {[key in number]: string[]} where number is the file size and the string is the file path
    const sizeGroup = fileSizes.reduce((acc, cur) => {
        if (Object.hasOwn(acc, cur.size)) {
            acc[cur.size].push(cur.path);
        }
        else {
            acc[cur.size] = [cur.path];
        }
        return acc;
    }, {});
    return Object.entries(sizeGroup).map(([size, paths]) => {
        return { size: Number(size), paths };
    });
};
/**
 * Returns a list of duplicate files found under the root directory.
 * @param {string} rootDir - The root directory to search for duplicate files.
 * @param {Filters} filters - {dir: string, file: string, ext: string}  "dir" and "file" filters are checked against the directory and file name respectively.  "ext" filter is checked against the file extension.  If multiple properties are specified, all properties must match for the file to pass the filter.
 * @returns {string[][]} A promise that resolves to an array of duplicate paths.  Each array element is an array of duplicate file paths.
 */
export const getDuplicates = async (rootDir, filters = {}) => {
    //compare two files to see if they are identical
    //if they are, return an array of the two file paths.  Otherwise, return null.
    const isDuplicate = async (f1, f2, size) => {
        return (await compareFileBuffer(f1, f2, size)) ? [f1, f2] : null;
    };
    try {
        await validateSrcDir(rootDir);
        //group files by file size.  filter out groups with only one file.
        const fileGroups = (await groupFilesBySize(rootDir, filters)).filter((group) => group.paths.length > 1);
        //end result
        const duplicateSets = [];
        for (const group of fileGroups) {
            //stores duplicate file paths from same size group.
            //compare files in a same size group against each other
            //Create 2-file combination without repetition of all files in a group
            //e.g. if a size group contains [fileA, fileB, fileC], then create pairs of [fileA, fileB], [fileA, fileC], [fileB, fileC]
            //Pass each combination to isDuplicate()
            //If files are identical push their file paths to duplicates array
            const duplicates = [];
            for (let i = 0; i < group.paths.length - 1; i++) {
                for (let j = i + 1; j < group.paths.length; j++) {
                    //if files are identical, push an array of the two file paths.  Otherwise push null.
                    const duplicate = await isDuplicate(group.paths[i], group.paths[j], group.size);
                    if (duplicate !== null)
                        duplicates.push(duplicate);
                }
            }
            //group duplicate file paths by their contents
            //If duplicate array holds an array of more than 4 file paths,
            const groupByContents = [];
            if (duplicates.length > 1) {
                for (const duplicate of duplicates) {
                    const arrIndex = groupByContents.findIndex((ary) => ary.includes(duplicate[0]) || ary.includes(duplicate[1]));
                    //if found, add the current file path to the accumulator array
                    //if not found, push current file path array to the accumulator array
                    arrIndex !== -1 ? groupByContents[arrIndex].push(...duplicate) : groupByContents.push(duplicate);
                }
                duplicateSets.push(...groupByContents.map((ary) => Array.from(new Set(ary))));
            }
            else {
                duplicateSets.push(...duplicates);
            }
        }
        return { data: duplicateSets, err: null };
    }
    catch (e) {
        return { data: null, err: e };
    }
};
/**
 * Compares two files to see if they are identical.
 * @private
 * @param {string} f1 - The first file path.
 * @param {string} f2 - The second file path.
 * @param {number} fileSize - The size of the file in bytes.
 * @returns {boolean} A promise that resolves to true if the files are identical and false if they are not.
 */
const compareFileBuffer = async (f1, f2, fileSize) => {
    //reading 8KB at a time
    const bufferSize = Buffer.poolSize || 8 * 1024;
    //open file handles for each file
    let file1;
    let file2;
    try {
        //if fileSize is not provided, get the file size from the file system
        let remainingSize;
        if (!fileSize) {
            const stats = await fsp.stat(f1);
            remainingSize = stats.size;
        }
        else {
            remainingSize = fileSize;
        }
        //open file handles for each file
        file1 = await fsp.open(f1);
        file2 = await fsp.open(f2);
        //create buffers to store file contents
        const buf1 = Buffer.alloc(bufferSize);
        const buf2 = Buffer.alloc(bufferSize);
        let bufferPosition = 0;
        //continue until all file contents are compared
        while (remainingSize > 0) {
            //set buffer size to the remaining size if it is less than the buffer size
            const readBufferSize = remainingSize > bufferSize ? bufferSize : remainingSize;
            //read file contents into buffer
            const [file1Shard, file2Shard] = await Promise.all([
                file1.read(buf1, 0, readBufferSize, bufferPosition),
                file2.read(buf2, 0, readBufferSize, bufferPosition),
            ]);
            //throw error if read failed or read result is less than bufferSize
            if (file1Shard === null || file2Shard === null)
                throw new Error("read failed in compareFileBuffer.");
            if (file1Shard.bytesRead < readBufferSize)
                throw new Error(`compareFileBuffer failed.  read result for ${f1} is less than the set bufferSize.`);
            if (file2Shard.bytesRead < readBufferSize)
                throw new Error(`compareFileBuffer failed.  read result for ${f2} is less than the set bufferSize.`);
            //If two buffers are not identical, return false
            if (!buf1.equals(buf2)) {
                await file1.close();
                await file2.close();
                return false;
            }
            //update remaining size and buffer position
            remainingSize -= readBufferSize;
            bufferPosition += readBufferSize;
        }
        //close file handles
        await file1.close();
        await file2.close();
        //two files are identical when all buffer comparisons came back equal
        return true;
    }
    catch (e) {
        throw e;
    }
};
