import { NodeId } from "./pythonFileTypes";

export class ClassInfo {
    name: string;
    bases?: string[];
    moduleId: NodeId;
    functions: FuncInfo[];

    constructor(name: string, moduleId: NodeId, bases?: string[]) {
        this.name = name;
        this.moduleId = moduleId;
        this.bases = bases;
        this.functions = [];
    }

    addFunction(functionInfo: FuncInfo) {
        this.functions.push(functionInfo);
    }

    toString(): string {
        let result = `ClassInfo: ${this.name}\n`;
        if (this.bases && this.bases.length > 0) {
            result += `  Bases: ${this.bases.join(", ")}\n`;
        }
        for (const functionInfo of this.functions) {
            result += functionInfo.toString();
        }
        return result;
    }

    toJSON(): any {
        return {
            name: this.name,
            bases: this.bases,
            moduleId: this.moduleId,
            functions: this.functions.map((funcInfo) => funcInfo.toJSON()),
        };
    }

    static fromJSON(json: any): ClassInfo {
        const classInfo = new ClassInfo(json.name, json.moduleId, json.bases);
        classInfo.functions = json.functions.map((funcData: any) =>
            FuncInfo.fromJSON(funcData)
        );
        return classInfo;
    }
}

export class FuncInfo {
    name: string;
    parameters: ParameterInfo[];
    return_type: TypeInfo | null;

    constructor(
        name: string,
        parameters: ParameterInfo[] = [],
        return_type: TypeInfo | null = null
    ) {
        this.name = name;
        this.parameters = parameters;
        this.return_type = return_type;
    }

    addParameter(parameterInfo: ParameterInfo) {
        this.parameters.push(parameterInfo);
    }

    toString(): string {
        let result = `  FunctionInfo: ${this.name}\n`;
        if (this.parameters.length > 0) {
            result += `    Parameters:\n`;
            for (const parameterInfo of this.parameters) {
                result += `      ${parameterInfo.toString()}\n`;
            }
        }
        if (this.return_type) {
            result += `    Return type: ${this.return_type.toString()}\n`;
        }
        return result;
    }

    toJSON(): any {
        return {
            name: this.name,
            parameters: this.parameters.map((paramInfo) => paramInfo.toJSON()),
            return_type: this.return_type ? this.return_type.toJSON() : null,
        };
    }

    static fromJSON(json: any): FuncInfo {
        const funcInfo = new FuncInfo(
            json.name,
            json.parameters,
            json.return_type
        );
        funcInfo.parameters = json.parameters.map((paramData: any) =>
            ParameterInfo.fromJSON(paramData)
        );
        if (json.return_type) {
            funcInfo.return_type = TypeInfo.fromJSON(json.return_type);
        }
        return funcInfo;
    }
}

export class ParameterInfo {
    name: string;
    type_hint?: TypeInfo;
    star: boolean;
    power: boolean;
    initial_value?: string;

    constructor(name: string, type_hint?: TypeInfo) {
        this.name = name;
        this.type_hint = type_hint;
        this.power = false;
        this.star = false;
    }

    toString(): string {
        let parameterString = `ParameterInfo: ${this.name}`;
        if (this.star) {
            parameterString = `ParameterInfo: *${this.name}`;
        }

        if (this.power) {
            parameterString = `ParameterInfo: **${this.name}`;
        }
        if (this.initial_value) {
            parameterString += ` = ${this.initial_value}`;
        }

        if (this.type_hint) {
            parameterString += ` (${this.type_hint.toString()})`;
        }
        return parameterString;
    }
    toOriginStr(): string {
        let parameterString = `${this.name}`;
        if (this.star) {
            parameterString = `*${this.name}`;
        }

        if (this.power) {
            parameterString = `**${this.name}`;
        }
        if (this.initial_value) {
            parameterString += `=${this.initial_value}`;
        }
        return parameterString;
    }

    toJSON(): any {
        return {
            name: this.name,
            type_hint: this.type_hint ? this.type_hint.toJSON() : undefined,
            star: this.star,
            power: this.power,
            initial_value: this.initial_value,
        };
    }

    static fromJSON(json: any): ParameterInfo {
        const paramInfo = new ParameterInfo(json.name);
        if (json.type_hint) {
            paramInfo.type_hint = TypeInfo.fromJSON(json.type_hint);
        }
        paramInfo.star = json.star;
        paramInfo.power = json.power;
        paramInfo.initial_value = json.initial_value;
        return paramInfo;
    }
}

export class TypeInfo {
    type: string;
    subtypes: TypeInfo[];

    constructor(type: string, subtypes: TypeInfo[] = []) {
        this.type = type;
        this.subtypes = subtypes;
    }

    getType(): string {
        return this.type;
    }

    getSubtypes(): TypeInfo[] {
        return this.subtypes;
    }

    toString(): string {
        if (this.subtypes.length > 0) {
            const subtypesStr = this.subtypes
                .map((subtype) => subtype.toString())
                .join(", ");
            return `${this.type}[${subtypesStr}]`;
        }
        return this.type;
    }

    toJSON(): any {
        if (this.subtypes.length === 0) {
            return {
                type: this.type,
            };
        } else {
            return {
                type: this.type,
                subtypes: this.subtypes.map((subtype) => subtype.toJSON()),
            };
        }
    }

    static fromJSON(json: any): TypeInfo {
        if (!json.subtypes) {
            return new TypeInfo(json.type);
        } else {
            const subtypes = json.subtypes.map((subtypeData: any) =>
                TypeInfo.fromJSON(subtypeData)
            );
            return new TypeInfo(json.type, subtypes);
        }
    }
}

export class ImportInfo {
    source: RelativePathInfo;
    importees?: (string | [string, string])[] | "*";
    alias?: string;

    constructor(
        source: RelativePathInfo,
        importees?: (string | [string, string])[] | "*",
        alias?: string
    ) {
        this.source = source;
        this.importees = importees;
        this.alias = alias;
    }

    getSource() {
        return this.source;
    }

    toJSON(): any {
        return {
            source: this.source.toJSON(),
            importees: this.importees,
            alias: this.alias,
        };
    }

    static fromJSON(json: any): ImportInfo {
        const { source, importees, alias } = json;
        return new ImportInfo(
            RelativePathInfo.fromJSON(source),
            importees,
            alias
        );
    }
}

export class RelativePathInfo {
    level: number;
    source: string[];
    fromFile: boolean;
    constructor(level: number, source: string[], fromFile: boolean) {
        this.level = level;
        this.source = source;
        this.fromFile = fromFile;
    }

    getSource() {
        return this.source;
    }

    toJSON(): any {
        return {
            level: this.level,
            source: this.source,
            fromFile: this.fromFile,
        };
    }

    static fromJSON(json: any): RelativePathInfo {
        const { level, source, fromFile } = json;
        return new RelativePathInfo(level, source, fromFile);
    }
}
