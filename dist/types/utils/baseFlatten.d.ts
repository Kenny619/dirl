import type { Filters, ReturnFormat, MoveResults } from "../types/type.js";
export declare const flattenAll: (srcDir: string, dstDir: string, separator?: string, filters?: Filters) => Promise<ReturnFormat<MoveResults>>;
export declare const flattenUnique: (srcDir: string, dstDir: string, separator?: string, filters?: Filters) => Promise<ReturnFormat<MoveResults>>;
export declare const valSeparator: (separator: string) => void;
export declare const flattenFilePath: (filePath: string, separator: string, srcDir: string, dstDir: string) => string;
//# sourceMappingURL=baseFlatten.d.ts.map