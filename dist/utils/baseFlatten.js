import fsp from "node:fs/promises";
import path from "node:path";
import { getPaths } from "./base.js";
import { validatetDirs } from "./validation.js";
import { getDuplicates } from "./baseGet.js";
export const flattenAll = async (srcDir, dstDir, separator = "_", filters = {}) => {
    try {
        //validate source and destination dir
        await validatetDirs(srcDir, dstDir);
    }
    catch (e) {
        return { data: null, err: e };
    }
    try {
        //validate separator
        valSeparator(separator);
        //get file paths residing under srcDir
        const { data: files, err } = await getPaths(srcDir, "file", filters);
        if (err)
            return { data: null, err: err };
        //return format
        const data = { succeeded: [], failed: [] };
        //return if no files are found under srcDir
        if (files.length === 0)
            return { data, err: null };
        //convert dstDir into an absolute path to align the format with srcDir
        const absDstDir = path.resolve(dstDir);
        //get filename to be used in the destination dir
        for (const srcFilePath of files) {
            const dstFilePath = flattenFilePath(srcFilePath, separator, srcDir, absDstDir);
            try {
                await fsp.copyFile(srcFilePath, dstFilePath);
                data.succeeded.push({ srcFilePath, dstFilePath });
            }
            catch (e) {
                data.failed.push({ srcFilePath, dstFilePath, err: e });
            }
        }
        return { data, err: null };
    }
    catch (e) {
        return { data: null, err: e };
    }
};
export const flattenUnique = async (srcDir, dstDir, separator = "_", filters = {}) => {
    try {
        //validate source and destination dir
        await validatetDirs(srcDir, dstDir);
    }
    catch (e) {
        return { data: null, err: e };
    }
    //validate separator
    valSeparator(separator);
    //get file paths under srcDir
    const { data: files, err: e } = await getPaths(srcDir, "file", filters);
    if (e)
        return { data: null, err: e };
    // console.log("getPaths", files);
    //return format
    const data = { succeeded: [], failed: [] };
    //return if no files are found under srcDir
    if (files.length === 0)
        return { data, err: null };
    //get duplicate file paths under srcDir
    const { data: duplicates, err } = await getDuplicates(srcDir, filters);
    if (err)
        return { data: null, err };
    //create an array of duplicate files to be excluded from the output
    //Take out 1 file from each duplicate group so that 1 file from duplicate group will
    //remain in the output
    let uniqueFiles = files;
    if (duplicates.length > 0) {
        const excludeFileListAry = duplicates.map((files) => files.pop());
        const excludeFileList = excludeFileListAry.flat();
        uniqueFiles = files.filter((file) => !excludeFileList.includes(file));
    }
    //convert dstDir into an absolute path to align the format with srcDir
    const absDstDir = path.resolve(dstDir);
    try {
        for (const srcFilePath of uniqueFiles) {
            const dstFilePath = flattenFilePath(srcFilePath, separator, srcDir, absDstDir);
            try {
                await fsp.copyFile(srcFilePath, dstFilePath);
                data.succeeded.push({ srcFilePath, dstFilePath });
            }
            catch (e) {
                data.failed.push({ srcFilePath, dstFilePath, err: e });
            }
        }
        return { data, err: null };
    }
    catch (e) {
        return { data: null, err: e };
    }
};
export const valSeparator = (separator) => {
    if (separator !== "_") {
        //throw an error when  \, /, :, *, ?, ", <, >, | is used in separator
        const invalidChars = new RegExp(/[\\/:*?"<>|]/);
        if (invalidChars.test(separator))
            throw new Error(`Separator:${separator} cannot be used in filenames.`);
    }
};
export const flattenFilePath = (filePath, separator, srcDir, dstDir) => {
    //get path separator
    const curSeparator = process.platform === "win32" ? "\\" : "/";
    //get the absolute path of srcDir
    const absSrcDir = path.resolve(srcDir);
    //get the relative path of filePath from srcDir
    const srcDirPath = path.dirname(filePath).replace(absSrcDir, "");
    //get the base file name of filePath
    const dstBaseName = path.basename(filePath);
    // delete the separator at the beginning of srcDirPath
    // then replace all the default path separators with passed separator
    let dstFileNamePrefix = srcDirPath.slice(1).split(curSeparator).join(separator);
    //if the length of filename exceeds 255 chars, shorten the filename.
    if (path.join(dstDir, dstFileNamePrefix, dstBaseName).length > 255) {
        //calculate the total length of the filepath
        const ttlLength = path.join(dstDir, dstFileNamePrefix, dstBaseName).length;
        const delCharCnt = ttlLength - 255 + 3; // +3 for replacing ... with deleted characters.
        dstFileNamePrefix = `${dstFileNamePrefix.slice(0, dstFileNamePrefix.length - delCharCnt)}...`;
    }
    //concatenate dstFileNamePrefix and dstBaseName with separator
    const dstFileName = dstFileNamePrefix.length > 0 ? `${dstFileNamePrefix}${separator}${dstBaseName}` : dstBaseName;
    return path.join(dstDir, dstFileName);
};
