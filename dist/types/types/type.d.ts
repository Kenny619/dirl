export type ReturnFormat<T> = {
    result: T;
    err: null;
} | {
    result: null;
    err: Error;
};
export type FilterKeys = "dir" | "file" | "ext";
export type Filters = Partial<{
    [Key in FilterKeys]: string;
}>;
export type RegexFilters = Partial<{
    [key in FilterKeys]: RegExp;
}>;
export type Mode = "copyOverwrite" | "copyDiff" | "copyIfNew" | "moveOverwrite" | "moveDiff" | "moveIfNew";
export type MovableFile = {
    srcFilePath: string;
    dstFilePath: string;
};
export type MoveResults = {
    succeeded: {
        srcFilePath: string;
        dstFilePath: string;
    }[];
    failed: {
        srcFilePath: string;
        dstFilePath: string;
        err: Error;
    }[];
};
//# sourceMappingURL=type.d.ts.map