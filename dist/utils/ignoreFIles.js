/**
 * Files to be excluded from file count
 * i.e. .DS_Store for MacOS and Thumbs.db and Desktop.ini for Windows
 */
export const ignoreFiles = process.platform === "darwin"
    ? [".DS_Store"]
    : process.platform === "win32"
        ? ["Thumbs.db", "Desktop.ini"]
        : [];
