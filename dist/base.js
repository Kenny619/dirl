import fsp from "node:fs/promises";
import path from "node:path";
class Dirlbass {
    async validateSrcAndDst(srcDir, dstDir) {
        //check srcDir and dstDir are not the same
        if (srcDir === dstDir) {
            throw new Error("source directory and destination directory cannot be the same.");
        }
        //validate directory path and dstDir is writable
        try {
            await this.validateDirectoryPath(srcDir);
            await this.isDirectoryWritable(dstDir);
        }
        catch (e) {
            throw new Error(`validateSrcAndDst failed.  ${e}`);
        }
        //check if srcDir is empty
        let empty = true;
        let dirents = [];
        try {
            dirents = await fsp.readdir(srcDir, { recursive: true, withFileTypes: true });
        }
        catch (e) {
            throw new Error(`readdir failed on ${srcDir}  ${e}`);
        }
        for (const dirent of dirents) {
            if (dirent.isFile()) {
                empty = false;
                break;
            }
        }
        //throw error if no file are found in srcDir
        if (empty) {
            throw new Error(`No files in source directory: ${srcDir}`);
        }
    }
    async validateDirectoryPath(dirPath) {
        try {
            const stat = await fsp.stat(dirPath);
            try {
                stat.isDirectory();
            }
            catch (e) {
                throw new Error(`${dirPath} is not a valid directory. ${e}`);
            }
        }
        catch (e) {
            throw new Error(`${dirPath} is not a valid directory.  ${e}`);
        }
    }
    async validateFilePath(filePath) {
        try {
            const stat = await fsp.stat(filePath);
            if (!stat.isFile())
                throw new Error(`${filePath} is not a valid file.`);
        }
        catch (e) {
            throw new Error(`${e.message}`);
        }
    }
    //protected
    createRegexFilters(filters) {
        const validatedRegex = {};
        //return empty obj if filters is empty
        if (Object.keys(filters).length === 0)
            return {};
        //filter out file and ext keys whne mode="directory"
        const filterKeys = ["dir", "file", "ext"];
        for (const key of filterKeys) {
            try {
                if (filterKeys.includes(key)) {
                    validatedRegex[key] = new RegExp(filters[key]);
                }
            }
            catch (e) {
                throw new Error(`createRegexFilters failed.  ${filters[key]} is not a valid RegExp.  ${e}`);
            }
        }
        return validatedRegex;
    }
    //protected
    async isPathMatchingFilters(entryPath, filters) {
        let mode = "";
        //validate filePath
        try {
            const stat = await fsp.stat(entryPath);
            if (stat.isFile()) {
                await this.validateFilePath(entryPath);
                mode = "file";
            }
            if (stat.isDirectory()) {
                await this.validateDirectoryPath(entryPath);
                mode = "directory";
            }
        }
        catch (e) {
            throw new Error(`isPathMatchingFilters failed.  ${entryPath} is not a valid ${mode} path.  ${e}`);
        }
        //exit with true if threre's no filter in option
        if (Object.keys(filters).length === 0)
            return true;
        //provide same property name for each path as the 'filters' object
        const testPath = mode === "file"
            ? {
                dir: path.dirname(entryPath),
                file: path.basename(entryPath, path.extname(entryPath)), //exclude file extention from test
                ext: path.extname(entryPath),
            }
            : {
                dir: entryPath, //entryPath is already an path.  No need to use path.dirname()
            };
        //test each filter properties exist in filters.  If any of the filter fails, return false
        for (const key in testPath) {
            if (!filters[key].test(testPath[key])) {
                return false;
            }
        }
        //If all filters passed the test, return true
        return true;
    }
    async isFileMovable(srcFilePath, dstFilePath, mode) {
        /* return true when file can be copied/moved, false when it cannot. */
        //throw error if source and destination are pointing to the same file
        if (srcFilePath === dstFilePath) {
            throw new Error(`srcFilePath and dstFilePath cannot be the same file.\r\nsrcFilePath: ${srcFilePath}\r\ndstFilePath: ${dstFilePath}`);
        }
        //validate directory paths
        try {
            await this.validateFilePath(srcFilePath);
            await this.isDirectoryWritable(path.dirname(dstFilePath));
        }
        catch (e) {
            throw new Error(`${e}`);
        }
        //No further checks for *Overwrite
        if (mode === "copyOverwrite" || mode === "moveOverwrite")
            return true;
        //check if a file already exist in dstFilePath
        try {
            const dstFile = await fsp.stat(dstFilePath);
            //For mode===copyIfNew/moveIfNew.  check the last modified date.  Return true if src file is newer than dst
            if (mode === "copyIfNew" || mode === "moveIfNew") {
                const srcFile = await fsp.stat(srcFilePath);
                return srcFile.mtimeMs > dstFile.mtimeMs;
            }
            //For mode === copyDiff/moveDiff.  Return false if a file already exists in dstFilePath
            if (dstFile.isFile()) {
                return false;
            }
            //If its not a file, then return true.
            return true;
        }
        catch (_) {
            //There is no file on dstFilePath.  Return true and perform copy/move operation
            return true;
        }
    }
    async isDirectoryWritable(dstPath) {
        try {
            //create a directory if it doesn't exist
            await fsp.mkdir(dstPath, { recursive: true });
        }
        catch (e) {
            throw new Error(`mkdir failed in isDirectoryWritable.  ${e.message} ${e.stack}`);
        }
        //tmp file for writing test
        const tempFilePath = `${dstPath}/.isDstDirWritable__test`;
        try {
            // Check if the directory is writable by trying to write a temporary file
            const file = await fsp.writeFile(tempFilePath, "");
        }
        catch (e) {
            throw new Error(`Failed to create and write to a file under ${dstPath} ${e.message} ${e.stack}`);
        }
        try {
            //delete the tmp test file
            await fsp.unlink(tempFilePath); // Clean up the temporary file
        }
        catch (e) {
            //ignore error if fs couldn't locate the file.  throw error only when the error is other than ENOENT.
            if (!/ENOENT|EPERM/.test(e.message))
                throw new Error(`Failed to unlink test file in ${dstPath} ${e.message} ${e.stack}`);
        }
        return true;
    }
}
export default Dirlbass;
