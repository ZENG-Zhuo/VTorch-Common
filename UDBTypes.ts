import { ClassInfo, FuncInfo } from "./pythonObjectTypes";

export type UDBData = {
    name: string;
    code: string;
};

export class UDBInfo {
    data: UDBData;
    parsed: boolean;
    classes: ClassInfo[] = [];
    functions: FuncInfo[] = [];
    constructor(data: UDBData) {
        this.data = data;
        this.parsed = false;
    }
}
