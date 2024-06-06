import fsp from "node:fs/promises";
import path from "node:path";
import dirLGet from "./get.js";
class DirlFlatten extends dirLGet {
    flatten;
    constructor() {
        super();
        this.flatten = {
            all: async (srcDir, dstDir, separator = "_", filters = {}) => {
                try {
                    await this.flattenDir(srcDir, dstDir, separator, filters);
                }
                catch (e) {
                    throw new Error(`${e}`);
                }
            },
            unique: async (srcDir, dstDir, separator = "_", filters = {}) => {
                try {
                    await this.flattenUnique(srcDir, dstDir, separator, filters);
                }
                catch (e) {
                    throw new Error(`${e}`);
                }
            },
        };
    }
    async flattenDir(srcDir, dstDir, separator = "_", filters = {}) {
        //validate srcDir, dstDir, and separator.  Get file paths from srcDir
        const files = await this.getSrcFileList(srcDir, dstDir, separator, filters);
        //create destination file path
        const copyFiles = files.map((file) => {
            const dstFilePath = this.flattenFilePath(path.dirname(file), path.basename(file), separator, srcDir, dstDir);
            return fsp.copyFile(file, dstFilePath);
        });
        //copy files
        try {
            await Promise.all(copyFiles.map((file) => file));
        }
        catch (e) {
            throw new Error(`copyFile failed in flattenDir.  ${e}`);
        }
    }
    async flattenUnique(srcDir, dstDir, separator = "_", filters = {}) {
        //validate srcDir, dstDir, and separator.  Get file paths from srcDir
        let srcFilePaths = [];
        try {
            srcFilePaths = await this.getSrcFileList(srcDir, dstDir, separator, filters);
        }
        catch (e) {
            throw new Error(`getSrcFileList failed in flattenUnique.  ${e}`);
        }
        let groups = [];
        try {
            groups = await super.groupFilesBySize(srcFilePaths);
        }
        catch (e) {
            throw new Error(`groupFilesBySize failed.  ${e}`);
        }
        let duplicates = [];
        try {
            duplicates = await super.findDuplicatesFromSizeGroup(groups);
        }
        catch (e) {
            throw new Error(`groupFilesBySize or findDuplicatesFromSizeGroup failed.  ${e}`);
        }
        const duplicatesToBeOmitted = [];
        for (const group of duplicates) {
            group.shift();
            duplicatesToBeOmitted.push(...group);
        }
        //create destination file path
        const copyFilesPromise = srcFilePaths
            .filter((file) => !duplicatesToBeOmitted.includes(file))
            .map((file) => {
            const dstFilePath = this.flattenFilePath(path.dirname(file), path.basename(file), separator, srcDir, dstDir);
            return fsp.copyFile(file, dstFilePath);
        });
        //copy files
        try {
            await Promise.all(copyFilesPromise);
        }
        catch (e) {
            throw new Error(`copyFile failed in flattenDir.  ${e}`);
        }
    }
    async getSrcFileList(srcDir, dstDir, separator = "_", filters = {}) {
        //validate separator
        if (separator !== "_") {
            //throw an error when  \, /, :, *, ?, ", <, >, | is used in separator
            const invalidChars = new RegExp(/[\\/:*?"<>|]/);
            if (invalidChars.test(separator))
                throw new Error(`Separator:${separator} cannot be used in filenames.`);
        }
        //validate src dst directory
        try {
            await super.validateSrcAndDst(srcDir, dstDir);
        }
        catch (e) {
            throw new Error(`Directory validtion failed in flattenDir.  ${e}`);
        }
        //listup file paths under srcDir
        let files = [];
        try {
            files = await super.getFilePaths(srcDir, filters);
        }
        catch (e) {
            throw new Error(`getFilePaths() in flattenDir failed.  ${e}`);
        }
        return files;
    }
    flattenFilePath(dirName, fileName, separator, srcDir, dstDir) {
        //delete common prefix=dirpath from dirName and replace / to separator
        let fNamePrefix = dirName.replace(srcDir, "");
        //convert \ to separator.  Delete the separator at the beginning.
        try {
            const regex = new RegExp(`^${separator}?`);
            fNamePrefix = fNamePrefix.split("\\").join(separator).replace(regex, "");
        }
        catch (e) {
            throw new Error(`RegExp failed to replace \ with ${separator}. ${e}`);
        }
        //if Total filename length exceeds 255 chars, shorten the filename.
        //Flatten file path and file name is joinned by "=="
        const flattenFileName = this.adjustFileNameLength(fNamePrefix, fileName, "==", dstDir);
        return path.join(dstDir, flattenFileName);
    }
    adjustFileNameLength(prefix, fileName, separator, dstDir) {
        //No adjustment are made if full filepath is < 255 chars.
        //Add separator between prefix and fileName only when prefix is not empty.
        if (dstDir.length + prefix.length + separator.length + fileName.length < 255) {
            return prefix.length > 0 ? `${prefix}${separator}${fileName}` : fileName;
        }
        const ttlLength = dstDir.length + prefix.length + fileName.length;
        const delCharCnt = ttlLength - 255 + 3; // +3 for replacing ... with deleted characters.
        const _prefix = prefix.length >= fileName.length ? `${prefix.slice(0, prefix.length - delCharCnt)}...` : prefix;
        const _fileName = fileName.length > prefix.length
            ? `${path.basename(fileName, path.extname(fileName)).slice(0, fileName.length - delCharCnt)}....${path.extname(fileName)}`
            : fileName;
        const _separator = separator.length > 0 ? separator : "";
        return `${_prefix}${_separator}${_fileName}`;
    }
}
export default DirlFlatten;
