import fsp from "node:fs/promises";
import path from "node:path";
import Dirlbass from "./base.js";
class DirlGet extends Dirlbass {
    get;
    constructor() {
        super();
        this.get = {
            filePaths: async (rootDir, filters = {}) => {
                try {
                    return await this.getFilePaths(rootDir, filters);
                }
                catch (e) {
                    throw `${e}`;
                }
            },
            dirPaths: async (rootDir, filters = {}) => {
                try {
                    return await this.getDirPaths(rootDir, filters);
                }
                catch (e) {
                    throw `${e}`;
                }
            },
            fileCount: async (rootDir, filters = {}) => {
                try {
                    return await this.getFileCount(rootDir, filters);
                }
                catch (e) {
                    throw `${e}`;
                }
            },
            fileSizes: async (rootDir, filters = {}) => {
                try {
                    return await this.getFileSizes(rootDir, filters);
                }
                catch (e) {
                    throw `${e}`;
                }
            },
            dirSizes: async (rootDir, filters = {}) => {
                try {
                    return await this.getDirSizes(rootDir, filters);
                }
                catch (e) {
                    throw `${e}`;
                }
            },
            duplicateFiles: async (rootDir, filters = {}) => {
                try {
                    return this.getDuplicates(rootDir, filters);
                }
                catch (e) {
                    throw `${e}`;
                }
            },
        };
    }
    async getFileSizes(root, filters = {}) {
        try {
            await super.validateDirectoryPath(root);
        }
        catch (e) {
            throw `${e}`;
        }
        let filePaths = [];
        try {
            filePaths = await this.getFilePaths(root, filters);
        }
        catch (e) {
            throw new Error(`getFilePath() failed in getFileSize.  ${e}`);
        }
        const fileStats = await Promise.all(filePaths.map((file) => fsp.stat(file)));
        const fileSizes = fileStats.map((file) => file.size);
        return filePaths.map((file, index) => {
            return { path: file, size: this.formatFileSizeInBytes(fileSizes[index]) };
        });
    }
    async getDirSizes(root, filters = {}) {
        let dirPaths = [];
        try {
            dirPaths = await this.getDirPaths(root, filters);
        }
        catch (e) {
            throw `${e}`;
        }
        //insert root dir.  Path.join to align the format, replace to delete the trailing slash/backslash
        dirPaths.unshift(path.join(root).replace(/[\\\\|\\|\/|\/\/]$/, ""));
        //create {dirpath: filesize} object
        const dirSizes = {};
        for (const dir of dirPaths)
            dirSizes[dir] = 0;
        try {
            const dirSizesSum = await this.getFileSizeSum(dirSizes, filters);
            return Object.keys(dirSizesSum).map((key) => {
                return { dir: key, size: this.formatFileSizeInBytes(dirSizes[key]) };
            });
            //.filter((directory) => directory.size !== "0B ");
        }
        catch (e) {
            throw new Error(`getFIleSizeSum failed during getDirSizes.  ${e}`);
        }
    }
    async getFileSizeSum(dirSizes, filters) {
        let filePaths = [];
        for (const dir in dirSizes) {
            try {
                filePaths = await this.getFilePaths(dir, filters);
            }
            catch (e) {
                throw new Error(`readdir failed in getFileSizeSum.  ${e}`);
            }
            //apply filer and store result<bool> to filtered
            const stats = await Promise.all(filePaths.map((file) => fsp.stat(file)));
            const sizeSum = stats.reduce((acc, cur) => {
                return cur.isFile() ? cur.size + acc : acc;
            }, 0);
            let _dir = dir;
            while (Object.hasOwn(dirSizes, _dir)) {
                dirSizes[_dir] = dirSizes[_dir] + sizeSum;
                const matched = _dir.match(/^((.*)[\\\\|\\|\/|\/\/])(?:.+?)(?=\/*$)/); //match path without last directory without trailing slash/backslash
                if (matched)
                    _dir = matched[2];
            }
        }
        return dirSizes;
    }
    formatFileSizeInBytes(bytes) {
        const units = ["B ", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB", "RB", "QB"];
        let i = 0;
        let b = bytes;
        while (b >= 1024 && i < units.length - 1) {
            b /= 1024;
            i++;
        }
        return `${b.toFixed(2)}${units[i]}`;
    }
    async getFilePaths(root, filters = {}) {
        //root directory validation
        try {
            await super.validateDirectoryPath(root);
        }
        catch (e) {
            throw `${e}`;
        }
        let Dirents = [];
        const filePaths = [];
        const regexpFilters = super.createRegexFilters(filters);
        try {
            Dirents = await fsp.readdir(root, { withFileTypes: true, recursive: true });
        }
        catch (e) {
            throw new Error(`readdir(${root}) faild in getFilePaths().  ${e}`);
        }
        for (const dirent of Dirents) {
            const filePath = path.join(dirent.path, dirent.name);
            if (dirent.isFile()) {
                if (regexpFilters) {
                    (await super.isPathMatchingFilters(filePath, regexpFilters)) && filePaths.push(filePath);
                }
                else {
                    filePaths.push(filePath);
                }
            }
        }
        return filePaths;
    }
    async getDirPaths(root, filters = {}) {
        //root directory validation
        try {
            await super.validateDirectoryPath(root);
        }
        catch (e) {
            throw `${e}`;
        }
        const dirPaths = [];
        //Create regexfilters only if dirNameFilter has value
        let regexpFilters = {};
        if (Object.hasOwn(filters, "dir")) {
            regexpFilters = super.createRegexFilters(filters);
        }
        let Dirents = [];
        try {
            Dirents = await fsp.readdir(root, { recursive: true, withFileTypes: true });
        }
        catch (e) {
            throw new Error(`readdir(${root}) failed in getFilePaths().  ${e}`);
        }
        for (const dirent of Dirents) {
            const entryPath = path.join(dirent.path, dirent.name);
            if (dirent.isDirectory()) {
                if (regexpFilters) {
                    (await super.isPathMatchingFilters(entryPath, regexpFilters)) && dirPaths.push(entryPath);
                }
                else {
                    dirPaths.push(entryPath);
                }
            }
        }
        return dirPaths;
    }
    async getFileCount(root, filters = {}) {
        try {
            const filePaths = await this.get.filePaths(root, filters);
            return filePaths.length;
        }
        catch (e) {
            throw `${e}`;
        }
    }
    async getDuplicates(root, filters = {}) {
        //validate root
        try {
            super.validateDirectoryPath(root);
        }
        catch (e) {
            throw `${e}`;
        }
        //get file path
        let filePaths = [];
        try {
            filePaths = await this.get.filePaths(root, filters);
        }
        catch (e) {
            throw `${e}`;
        }
        //create {filesize: [filepath]} object
        let sizeGroup = {};
        try {
            sizeGroup = await this.groupFilesBySize(filePaths);
        }
        catch (e) {
            throw `${e}`;
        }
        //Among the fileSizeGroup, keep the files with same contents.  Return in string[][] format.
        return this.findDuplicatesFromSizeGroup(sizeGroup);
    }
    async groupFilesBySize(filePaths) {
        //get filesizes of each files
        let fileSizes = [];
        try {
            const stats = await Promise.all(filePaths.map((file) => fsp.stat(file)));
            fileSizes = stats.map((stat) => stat.size);
        }
        catch (e) {
            throw new Error(`fsp.stat() failed in groupFilesBySize.  ${e}`);
        }
        //create an object of {filesize: [file path]} and group file path with same file size
        const sizeGroup = {};
        return filePaths.reduce((acc, cur, index) => {
            if (Object.hasOwn(acc, fileSizes[index])) {
                acc[fileSizes[index]].push(cur);
            }
            else {
                acc[fileSizes[index]] = [cur];
            }
            return acc;
        }, sizeGroup);
    }
    async findDuplicatesFromSizeGroup(fileGroupBySize) {
        //get the file content of each file and compare among the same group
        //return array
        const results = [];
        for (const pathGroup of Object.values(fileGroupBySize)) {
            //continue the loop if pathGroup contains contain only 1 path = no equal size files.
            if (pathGroup.length === 1)
                continue;
            //get file buffers from each file path pathGroup
            let buffers = [];
            try {
                buffers = await Promise.all(pathGroup.map((file) => fsp.readFile(file)));
            }
            catch (e) {
                throw new Error(`fsdreadFile() failed in findDuplicatesFromSizeGroup.  ${e}`);
            }
            //compare
            const duplicates = []; //duplicate file path storage
            let left = 0; //left pointer
            let right = 1; // right pointer
            //while right and left pointers were within the range of the buffers array.
            //Exit loop if either of pointers are out of the range.
            //repeat until left and right pointers are next to each other at the end of buffer array.
            while (left !== buffers.length - 1 && right !== buffers.length) {
                //compare buffers on left and right pointers.
                //If they are equal, push both paths to duplicates array.
                buffers[left].equals(buffers[right]) && duplicates.push(pathGroup[left], pathGroup[right]);
                //Move on to next comparison.  Increment right pointer by 1.
                right++;
                //if right pointer is at the end of the array, move left pointer by 1.
                //Reset right pointer's position by putting it on the right side of the left pointer.
                if (right === buffers.length) {
                    left++;
                    right = left + 1;
                }
            }
            //If any duplicates were found, create an unique list of duplicate paths
            //and push them to results array
            if (duplicates.length > 0)
                results.push(Array.from(new Set(duplicates)));
        }
        return results;
    }
}
export default DirlGet;
