import fsp from "node:fs/promises";
import path from "node:path";
import { getDirents, isDirTreeEmpty } from "./base.js";
import { validatetDirs } from "./validation.js";
export const transferFiles = async (srcDir, dstDir, mode, filters) => {
    //Validate Dir
    try {
        await validatetDirs(srcDir, dstDir);
    }
    catch (e) {
        return { result: null, err: e };
    }
    //get source directory and file paths
    const { result: srcFilePaths, err: e } = await getDirents(srcDir, "all", filters);
    if (e)
        return { result: null, err: e };
    //reverse order.  Working from bottom to top allowing empty dir to be deleted
    //when mode is set to move
    srcFilePaths.reverse();
    //Return data format
    //log successful and failed attempts on moving/copying files
    const moveResults = { succeeded: [], failed: [] };
    //generate destination file path for each files
    //filter out files that are not movable
    //return movable files in {srcFilePath, dstFilePath} format
    const movables = (await Promise.all(srcFilePaths.map(async (dirent) => {
        return await getMovableDirents(srcDir, dstDir, dirent, mode);
    }))).filter((result) => result !== null);
    //if no movable items are found return empty moveResults
    if (movables.length === 0)
        return { result: moveResults, err: null };
    //transfer files
    for (const entry of movables) {
        //
        if (entry === null)
            continue;
        //define paths
        const srcFilePath = entry.srcFilePath;
        const dstFilePath = entry.dstFilePath;
        //create dstPath
        //if entry is a directory,
        try {
            entry.dirent.isDirectory()
                ? await fsp.mkdir(dstFilePath, { recursive: true })
                : await fsp.mkdir(path.dirname(dstFilePath), { recursive: true });
        }
        catch (e) {
            moveResults.failed.push({ srcFilePath, dstFilePath, err: e });
            continue;
        }
        //if entry is a file, copy the file to dstPath
        if (entry.dirent.isFile()) {
            try {
                await fsp.copyFile(srcFilePath, dstFilePath);
            }
            catch (e) {
                moveResults.failed.push({ srcFilePath, dstFilePath, err: e });
                continue;
            }
        }
        //delete the original file if mode is set to move*
        if (/^move/.test(mode)) {
            //delete the source
            try {
                await delSrc(srcFilePath, entry.dirent);
            }
            catch (e) {
                moveResults.failed.push({ srcFilePath, dstFilePath, err: e });
                continue;
            }
        }
        //copy/move operation is successfully done.  Push file paths into moveResults.succeeded
        moveResults.succeeded.push({ srcFilePath, dstFilePath });
    }
    return { result: moveResults, err: null };
};
/**
 * Checks if a file can be copied/moved to a destination directory.  If movable, returns a promise of an object with srcFilePath, dstFilePath, and dirent properties.  Otherwise, returns null.
 * @param srcDir - The source directory.
 * @param dstDir - The destination directory.
 * @param dirent - The dirent object.
 * @param mode - "Overwrite" will always copy/move the file and overwrite the destination file if it exists.  "IfNew" will copy/move the source file if it doesn't exist in the destination, or overwrites the existing file in destination only if the source file is newer than the destination file.  "Diff" will copy/move the files only if it doesn't exist in the destination directory.
 * @returns Promise<{ srcFilePath: string; dstFilePath: string; dirent: Dirent } | null> - Resolves with an object with srcFilePath, dstFilePath, and dirent properties if the file can be copied/moved, or null otherwise.
 */
export const getMovableDirents = async (srcDir, dstDir, dirent, mode) => {
    const srcFilePath = path.join(dirent.parentPath, dirent.name);
    const dstFilePath = srcFilePath.replace(path.resolve(srcDir), path.resolve(dstDir));
    //No further checks for *Overwrite
    if (mode === "copyOverwrite" || mode === "moveOverwrite") {
        return { srcFilePath, dstFilePath, dirent };
    }
    //get stat of source file for "IfNew" and "Diff"
    let srcFileStat;
    try {
        srcFileStat = await fsp.stat(srcFilePath);
    }
    catch (e) {
        throw e;
    }
    try {
        //get Stats from dstFilePath and check if it already exits
        const dstFileStat = await fsp.stat(dstFilePath);
        //For mode === copyIfNew/moveIfNew,  check the last modified date.
        //Return true if src file is newer than dst
        if (mode === "copyIfNew" || mode === "moveIfNew") {
            return srcFileStat.mtimeMs > dstFileStat.mtimeMs
                ? { srcFilePath, dstFilePath, dirent }
                : null;
        }
        //For mode === copyDiff/moveDiff.
        //Return false if a file already exists in dstFilePath
        if (mode === "copyDiff" || mode === "moveDiff") {
            return null;
        }
        //for any other conditions, return true;
        return { srcFilePath, dstFilePath, dirent };
    }
    catch (e) {
        //if stat failed then there is no entry on dstFilePath
        //mode = *IfNew and *Diff will all be valid to move/copy the entry
        return { srcFilePath, dstFilePath, dirent };
    }
};
export const delSrc = async (srcPath, dirent) => {
    if (dirent.isDirectory()) {
        //when dirent is a directory
        //check if the directory is empty, if empty, delete the directory
        try {
            if (await isDirTreeEmpty(srcPath)) {
                await fsp.rmdir(srcPath);
            }
            else {
                throw `file exists under ${srcPath}`;
            }
        }
        catch (e) {
            throw e;
        }
    }
    else {
        //when dirent is a file
        try {
            await fsp.rm(srcPath, { maxRetries: 3, retryDelay: 1000 });
        }
        catch (e) {
            throw e;
        }
    }
};
