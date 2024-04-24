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
    static fromJSON(json: any): UDBInfo {
        const udbInfo = new UDBInfo(json.data);
        udbInfo.parsed = json.parsed;

        if (json.classes && Array.isArray(json.classes)) {
            udbInfo.classes = json.classes.map((classJson: any) =>
                ClassInfo.fromJSON(classJson)
            );
        }

        if (json.functions && Array.isArray(json.functions)) {
            udbInfo.functions = json.functions.map((funcJson: any) =>
                FuncInfo.fromJSON(funcJson)
            );
        }

        return udbInfo;
    }

    toJSON(): any {
        return {
            data: this.data,
            parsed: this.parsed,
            classes: this.classes.map((classInfo) => classInfo.toJSON()),
            functions: this.functions.map((funcInfo) => funcInfo.toJSON()),
        };
    }
}
